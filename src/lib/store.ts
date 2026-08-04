/**
 * The shared care store.
 *
 * In production the caregiver phone and the senior device are two separate
 * clients kept in sync through Supabase realtime (see lib/supabase.ts and the
 * schema in supabase/schema.sql). For this Expo Go MVP both surfaces read and
 * write one local, AsyncStorage-persisted store, so you can flip roles on a
 * single device and watch data flow end to end:
 *   caregiver logs a medication  ->  senior scans/takes it  ->  caregiver sees adherence.
 *
 * Every mutation here is written to be a drop-in for a Supabase call: same
 * shapes, same ids. `maybeSyncEvent()` is the one seam where you'd fan an event
 * out to the backend instead of (or in addition to) the local list.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  CareEvent,
  CareState,
  DoseLog,
  EventKind,
  EventSeverity,
  LovedOne,
  Medication,
  Role,
} from '../types';
import { maybeSyncEvent } from './supabase';
import { overdueUnmarked, todaysDoses, type DoseSlot } from './adherence';
import { refillStatus } from './refill';
import { fireAlert } from './notifications';
import { scheduleEscalation, cancelEscalation } from './escalation';

// How long the home can be quiet during waking hours before we flag a check-in.
export const SILENCE_THRESHOLD_HOURS = 6;
const WAKING_START = 7; // 7am
const WAKING_END = 22; // 10pm

const uid = () => Math.random().toString(36).slice(2, 10);
const code6 = () =>
  Math.random().toString(36).slice(2, 8).toUpperCase().replace(/[^A-Z0-9]/g, 'X');

const firstNameOf = (lovedOne: LovedOne | null) => lovedOne?.name?.split(' ')[0] ?? 'Your loved one';

// Kinds that count as "the home is alive" — they refresh the activity heartbeat.
const ACTIVITY_KINDS: EventKind[] = [
  'scan_match',
  'scan_mismatch',
  'voice_distress',
  'voice_call',
  'voice_meds',
  'loud_sound',
  'activity',
];

interface CareActions {
  setRole: (role: Role) => void;
  signOut: () => void;

  createLovedOne: (name: string, relationship: string) => void;
  updateLovedOne: (patch: Partial<LovedOne>) => void;
  confirmPairing: (code: string) => boolean;

  addMedication: (m: Omit<Medication, 'id'>) => void;
  updateMedication: (id: string, patch: Partial<Medication>) => void;
  removeMedication: (id: string) => void;

  logEvent: (
    e: Pick<CareEvent, 'kind' | 'severity' | 'title'> & Partial<Pick<CareEvent, 'detail'>>,
  ) => CareEvent;
  acknowledgeEvent: (id: string) => void;
  markActivity: () => void;
  setAmbientRunning: (v: boolean) => void;

  // Dose tracking
  markDoseTaken: (medId: string, scheduledAt: number, source: DoseLog['source']) => void;
  markDoseSkipped: (medId: string, scheduledAt: number) => void;
  reconcileDoses: (now?: number) => void;

  sendCheckIn: (message: string) => void;
  clearCheckIn: () => void;

  seedDemo: () => void;
  clearEvents: () => void;
}

export type Store = CareState & CareActions;

const initial: CareState = {
  role: null,
  lovedOne: null,
  medications: [],
  events: [],
  doseLogs: [],
  lastActivityAt: null,
  ambientRunning: false,
  checkIn: null,
};

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...initial,

      setRole: (role) => set({ role }),
      signOut: () => set({ role: null }),

      createLovedOne: (name, relationship) =>
        set({
          lovedOne: {
            id: uid(),
            name: name.trim(),
            relationship: relationship.trim(),
            pairingCode: code6(),
            paired: false,
            ambientOptIn: false,
            alwaysOnMode: true,
          },
        }),

      updateLovedOne: (patch) => {
        const cur = get().lovedOne;
        if (!cur) return;
        set({ lovedOne: { ...cur, ...patch } });
      },

      confirmPairing: (code) => {
        const cur = get().lovedOne;
        if (!cur) return false;
        const ok = code.trim().toUpperCase() === cur.pairingCode;
        if (ok) set({ lovedOne: { ...cur, paired: true } });
        return ok;
      },

      addMedication: (m) =>
        set({
          medications: [...get().medications, { ...m, id: uid(), createdAt: m.createdAt ?? Date.now() }],
        }),

      updateMedication: (id, patch) =>
        set({
          medications: get().medications.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        }),

      removeMedication: (id) =>
        set({ medications: get().medications.filter((m) => m.id !== id) }),

      logEvent: (e) => {
        const event: CareEvent = { id: uid(), at: Date.now(), ...e };
        const bumpsActivity = ACTIVITY_KINDS.includes(event.kind);
        set({
          events: [event, ...get().events].slice(0, 200),
          lastActivityAt: bumpsActivity ? event.at : get().lastActivityAt,
        });
        // The one seam that would push to the backend in production.
        maybeSyncEvent(event);
        return event;
      },

      acknowledgeEvent: (id) => {
        set({
          events: get().events.map((e) =>
            e.id === id ? { ...e, acknowledgedAt: Date.now() } : e,
          ),
        });
        // Stop any pending escalation for this event.
        cancelEscalation(id);
      },

      markActivity: () => set({ lastActivityAt: Date.now() }),
      setAmbientRunning: (v) => set({ ambientRunning: v }),

      markDoseTaken: (medId, scheduledAt, source) => {
        const now = Date.now();
        const { doseLogs, medications, lovedOne } = get();
        const existing = doseLogs.find((l) => l.medId === medId && l.scheduledAt === scheduledAt);
        if (existing) {
          set({
            doseLogs: doseLogs.map((l) =>
              l === existing ? { ...l, status: 'taken', takenAt: now, source } : l,
            ),
          });
        } else {
          const log: DoseLog = { id: uid(), medId, scheduledAt, status: 'taken', takenAt: now, source };
          set({ doseLogs: [log, ...doseLogs] });
        }

        const med = medications.find((m) => m.id === medId);
        if (!med) return;

        // Decrement supply and check for a low-refill crossing.
        if (typeof med.pillsOnHand === 'number') {
          const nextPills = Math.max(0, med.pillsOnHand - 1);
          get().updateMedication(medId, { pillsOnHand: nextPills });
          const rs = refillStatus({ ...med, pillsOnHand: nextPills }, now);
          if (rs && rs.low && (nextPills === rs.threshold || nextPills === 0)) {
            const daysNote =
              rs.daysLeft != null ? ` — about ${rs.daysLeft} day${rs.daysLeft === 1 ? '' : 's'} left` : '';
            const pharmacyNote = lovedOne?.pharmacy ? ` Refill at ${lovedOne.pharmacy}.` : ' Time to refill.';
            const ev = get().logEvent({
              kind: 'refill_low',
              severity: 'checkIn',
              title: `${med.name} is running low`,
              detail: `${nextPills} left${daysNote}.${pharmacyNote}`,
            });
            if (lovedOne) fireAlert(ev, firstNameOf(lovedOne));
          }
        }

        // A manual "I took it" tap should show up in the caregiver's activity feed.
        // (The scan path already logs its own scan_match event.)
        if (source === 'manual') {
          get().logEvent({
            kind: 'activity',
            severity: 'info',
            title: `${firstNameOf(lovedOne)} took ${med.name}`,
          });
        }
      },

      markDoseSkipped: (medId, scheduledAt) => {
        const { doseLogs } = get();
        const existing = doseLogs.find((l) => l.medId === medId && l.scheduledAt === scheduledAt);
        if (existing) {
          set({
            doseLogs: doseLogs.map((l) =>
              l === existing ? { ...l, status: 'skipped', source: 'manual' } : l,
            ),
          });
        } else {
          set({
            doseLogs: [
              { id: uid(), medId, scheduledAt, status: 'skipped', source: 'manual' },
              ...doseLogs,
            ],
          });
        }
      },

      reconcileDoses: (now = Date.now()) => {
        const { medications, doseLogs, lovedOne } = get();
        const overdue = overdueUnmarked(medications, doseLogs, now);
        if (!overdue.length) return;

        // Materialize the misses first so repeat calls are idempotent.
        const newLogs: DoseLog[] = overdue.map((slot) => ({
          id: uid(),
          medId: slot.med.id,
          scheduledAt: slot.scheduledAt,
          status: 'missed',
          source: 'auto',
        }));
        set({ doseLogs: [...newLogs, ...get().doseLogs] });

        // One alert per med (grouped), escalating critical meds to urgent.
        const byMed = new Map<string, DoseSlot[]>();
        for (const slot of overdue) {
          const arr = byMed.get(slot.med.id) ?? [];
          arr.push(slot);
          byMed.set(slot.med.id, arr);
        }
        const first = firstNameOf(lovedOne);
        byMed.forEach((slots) => {
          const med = slots[0].med;
          const n = slots.length;
          const severity: EventSeverity = med.critical ? 'urgent' : 'checkIn';
          const ev = get().logEvent({
            kind: 'missed_dose',
            severity,
            title: `${first} may have missed ${med.name}`,
            detail: `${n} dose${n > 1 ? 's' : ''} not marked taken (${med.dosage}).`,
          });
          if (lovedOne) {
            fireAlert(ev, first);
            if (severity === 'urgent') scheduleEscalation(ev, lovedOne);
          }
        });
      },

      sendCheckIn: (message) => set({ checkIn: message }),
      clearCheckIn: () => set({ checkIn: null }),

      seedDemo: () => {
        get().createLovedOne('Rose', 'Mother');
        get().updateLovedOne({
          dob: '1944-03-12',
          bloodType: 'O+',
          allergies: ['Penicillin', 'Sulfa drugs'],
          conditions: ['Atrial fibrillation', 'Type 2 diabetes', 'High blood pressure'],
          emergencyContacts: [
            { name: 'Alex Rivera', relationship: 'Daughter', phone: '+15125550110' },
            { name: 'Sam Rivera', relationship: 'Son', phone: '+15125550120' },
          ],
          doctor: 'Dr. Ede — (512) 555-0140',
          pharmacy: 'CVS on Main St — (512) 555-0170',
          medicalNotes: 'Pacemaker since 2019. Hard of hearing on the left.',
        });

        const meds: Omit<Medication, 'id'>[] = [
          {
            name: 'Lisinopril',
            genericName: 'lisinopril',
            dosage: '10mg — 1 pill',
            schedule: 'morning',
            times: ['08:00'],
            friendlyName: 'your blood pressure medicine',
            barcode: '036800111213',
            pillsOnHand: 24,
          },
          {
            name: 'Metformin',
            genericName: 'metformin',
            dosage: '500mg — 1 pill',
            schedule: 'evening',
            times: ['08:00', '18:00'],
            friendlyName: 'your sugar medicine',
            barcode: '300450123458',
            pillsOnHand: 9,
            refillThreshold: 10,
          },
          {
            name: 'Atorvastatin',
            genericName: 'atorvastatin',
            dosage: '20mg — 1 pill',
            schedule: 'bedtime',
            times: ['21:00'],
            friendlyName: 'your cholesterol medicine',
            pillsOnHand: 30,
          },
          {
            name: 'Warfarin',
            genericName: 'warfarin',
            dosage: '5mg — 1 pill',
            schedule: 'evening',
            times: ['18:00'],
            friendlyName: 'your blood thinner',
            critical: true,
            pillsOnHand: 20,
          },
          {
            name: 'Aspirin',
            genericName: 'aspirin',
            dosage: '81mg — 1 pill',
            schedule: 'morning',
            times: ['08:00'],
            friendlyName: 'your low-dose aspirin',
            pillsOnHand: 90,
          },
        ];
        meds.forEach((m) => get().addMedication(m));
        set({ lastActivityAt: Date.now() });
      },

      clearEvents: () => set({ events: [], lastActivityAt: null }),
    }),
    {
      name: 'ambient-care-v1',
      storage: createJSONStorage(() => AsyncStorage),
      // New fields (doseLogs, medical profile, dose times) are optional or backfilled
      // by the default shallow merge, so old persisted state upgrades cleanly.
    },
  ),
);

export type StatusLevel = 'calm' | 'checkIn' | 'urgent';

/**
 * Derived, low-noise status — the synthesized signal, not a data dump. Fuses
 * urgent events, critical missed doses, unusual silence, and lesser check-ins
 * into one calm/check-in/urgent verdict.
 */
export function computeStatus(state: CareState): {
  key: StatusLevel;
  reason: string;
} {
  const now = Date.now();
  const recent = state.events.filter((e) => now - e.at < 24 * 3600 * 1000);

  const urgent = recent.find((e) => e.severity === 'urgent');
  if (urgent) return { key: 'urgent', reason: urgent.title };

  // Critical missed dose is urgent even if the event was pruned/cleared.
  const missedToday = todaysDoses(state.medications, state.doseLogs, now).filter(
    (d) => d.status === 'missed',
  );
  const criticalMissed = missedToday.find((d) => d.med.critical);
  if (criticalMissed) {
    return { key: 'urgent', reason: `Missed ${criticalMissed.med.name} (critical medication)` };
  }

  // Silence anomaly: quiet for too long during waking hours.
  const hour = new Date(now).getHours();
  const withinWaking = hour >= WAKING_START && hour <= WAKING_END;
  if (withinWaking && state.lastActivityAt) {
    const quietHours = (now - state.lastActivityAt) / 3600000;
    if (quietHours >= SILENCE_THRESHOLD_HOURS) {
      return {
        key: 'checkIn',
        reason: `No activity for ${Math.floor(quietHours)}h during the day`,
      };
    }
  }

  const checkIn = recent.find((e) => e.severity === 'checkIn');
  if (checkIn) return { key: 'checkIn', reason: checkIn.title };

  if (missedToday.length) {
    return {
      key: 'checkIn',
      reason: `${missedToday.length} missed dose${missedToday.length > 1 ? 's' : ''} today`,
    };
  }

  return { key: 'calm', reason: 'Normal activity today' };
}
