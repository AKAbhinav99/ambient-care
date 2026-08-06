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
  Account,
  CareEvent,
  CareState,
  ChatMessage,
  DoseLog,
  EventKind,
  EventSeverity,
  LovedOne,
  Medication,
  RecipientData,
  Role,
} from '../types';
import {
  fetchMessagesRemote,
  fetchRoster,
  isSupabaseConfigured,
  maybeSyncEvent,
  redeemCode,
  sendMessageRemote,
  upsertRecipient,
} from './supabase';
import { signOut as authSignOut } from './auth';
import { mergeMessages } from './chat';
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

const emptySlice = (): RecipientData => ({
  medications: [],
  doseLogs: [],
  events: [],
  lastActivityAt: null,
  messages: [],
  lastSeenBySeniorAt: null,
  lastSeenByCaregiverAt: null,
});

/** Snapshot the active recipient's live top-level fields into a slice. */
const snapshotActive = (s: CareState): RecipientData => ({
  medications: s.medications,
  doseLogs: s.doseLogs,
  events: s.events,
  lastActivityAt: s.lastActivityAt,
  messages: s.messages,
  lastSeenBySeniorAt: s.lastSeenBySeniorAt,
  lastSeenByCaregiverAt: s.lastSeenByCaregiverAt,
});

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

  // Auth (caregiver)
  setAccount: (account: Account | null) => void;
  signOutAccount: () => void;
  hydrateRoster: () => Promise<void>;

  // Multi-recipient roster
  createLovedOne: (name: string, relationship: string) => void;
  updateLovedOne: (patch: Partial<LovedOne>) => void;
  setActiveRecipient: (id: string) => void;
  bindByCode: (code: string) => Promise<boolean>;
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

  // Chat (active recipient's thread)
  sendMessage: (body: string) => void;
  syncMessages: () => Promise<void>;
  markSeen: (role: Role) => void;

  seedDemo: () => void;
  clearEvents: () => void;
}

export type Store = CareState & CareActions;

const initial: CareState = {
  role: null,
  account: null,
  authStatus: 'unknown',
  roster: [],
  activeLovedOneId: null,
  recipients: {},
  seniorBoundId: null,
  lovedOne: null,
  medications: [],
  events: [],
  doseLogs: [],
  lastActivityAt: null,
  ambientRunning: false,
  messages: [],
  lastSeenBySeniorAt: null,
  lastSeenByCaregiverAt: null,
};

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...initial,

      setRole: (role) => set({ role }),
      // "Switch" from a surface — returns to the role picker but keeps the account.
      // Also unbinds the home device so it re-prompts for a code on next entry.
      signOut: () => set({ role: null, seniorBoundId: null }),

      setAccount: (account) => {
        set({ account, authStatus: account ? 'signedIn' : 'signedOut' });
        if (account && !account.local) get().hydrateRoster();
      },

      // Full caregiver logout: end the Supabase session and reset local state.
      signOutAccount: () => {
        authSignOut();
        set({ ...initial, authStatus: 'signedOut' });
      },

      // Merge the caregiver's cloud recipient roster in (cloud-only; no-op offline).
      hydrateRoster: async () => {
        const s = get();
        if (!s.account || s.account.local || !isSupabaseConfigured) return;
        const cloud = await fetchRoster(s.account.id);
        if (!cloud.length) return;
        const cur = get();
        const recipients = { ...cur.recipients };
        const byId = new Map(cloud.map((r) => [r.id, r]));
        // Update known entries with the cloud copy; append unknown ones.
        const merged = cur.roster.map((r) => byId.get(r.id) ?? r);
        for (const r of cloud) {
          if (!merged.some((m) => m.id === r.id)) merged.push(r);
          recipients[r.id] = recipients[r.id] ?? emptySlice();
        }
        set({ roster: merged, recipients });
        if (!get().activeLovedOneId && merged.length) get().setActiveRecipient(merged[0].id);
      },

      createLovedOne: (name, relationship) => {
        const s = get();
        const lovedOne: LovedOne = {
          id: uid(),
          name: name.trim(),
          relationship: relationship.trim(),
          caregiverId: s.account?.id,
          pairingCode: code6(),
          paired: false,
          ambientOptIn: false,
          alwaysOnMode: true,
        };
        const recipients = { ...s.recipients };
        if (s.activeLovedOneId) recipients[s.activeLovedOneId] = snapshotActive(s);
        recipients[lovedOne.id] = emptySlice();
        set({
          roster: [...s.roster, lovedOne],
          recipients,
          activeLovedOneId: lovedOne.id,
          lovedOne,
          medications: [],
          doseLogs: [],
          events: [],
          lastActivityAt: null,
          messages: [],
          lastSeenBySeniorAt: null,
          lastSeenByCaregiverAt: null,
        });
        upsertRecipient(lovedOne);
      },

      updateLovedOne: (patch) => {
        const s = get();
        const cur = s.lovedOne;
        if (!cur) return;
        const next = { ...cur, ...patch };
        set({
          lovedOne: next,
          roster: s.roster.map((r) => (r.id === next.id ? next : r)),
        });
        upsertRecipient(next);
      },

      // Switch which recipient is active (the "mirror" swap): stash the current
      // slice, load the target's. Existing screens keep reading the top-level fields.
      setActiveRecipient: (id) => {
        const s = get();
        if (s.activeLovedOneId === id) return;
        const recipients = { ...s.recipients };
        if (s.activeLovedOneId) recipients[s.activeLovedOneId] = snapshotActive(s);
        const slice = recipients[id] ?? emptySlice();
        recipients[id] = slice;
        set({
          activeLovedOneId: id,
          recipients,
          lovedOne: s.roster.find((r) => r.id === id) ?? null,
          medications: slice.medications,
          doseLogs: slice.doseLogs,
          events: slice.events,
          lastActivityAt: slice.lastActivityAt,
          messages: slice.messages,
          lastSeenBySeniorAt: slice.lastSeenBySeniorAt,
          lastSeenByCaregiverAt: slice.lastSeenByCaregiverAt,
        });
      },

      // Home device: bind to a recipient by join code. Looks in the local roster
      // first (single-device demo), then the cloud RPC (real cross-device).
      bindByCode: async (code) => {
        const norm = code.trim().toUpperCase();
        if (!norm) return false;
        let target = get().roster.find((r) => r.pairingCode === norm) ?? null;
        if (!target && isSupabaseConfigured) target = await redeemCode(norm);
        if (!target) return false;

        const bound: LovedOne = { ...target, paired: true };
        const s = get();
        const inRoster = s.roster.some((r) => r.id === bound.id);
        const roster = inRoster
          ? s.roster.map((r) => (r.id === bound.id ? bound : r))
          : [...s.roster, bound];

        // If we're binding to the recipient that's already active, the live data
        // is in the top-level fields — keep it, don't reload the (stale) slice.
        if (s.activeLovedOneId === bound.id) {
          set({ role: 'senior', seniorBoundId: bound.id, roster, lovedOne: bound });
          upsertRecipient(bound);
          return true;
        }

        const recipients = { ...s.recipients };
        if (s.activeLovedOneId) recipients[s.activeLovedOneId] = snapshotActive(s);
        const slice = recipients[bound.id] ?? emptySlice();
        recipients[bound.id] = slice;
        set({
          role: 'senior',
          seniorBoundId: bound.id,
          roster,
          recipients,
          activeLovedOneId: bound.id,
          lovedOne: bound,
          medications: slice.medications,
          doseLogs: slice.doseLogs,
          events: slice.events,
          lastActivityAt: slice.lastActivityAt,
          messages: slice.messages,
          lastSeenBySeniorAt: slice.lastSeenBySeniorAt,
          lastSeenByCaregiverAt: slice.lastSeenByCaregiverAt,
        });
        upsertRecipient(bound);
        return true;
      },

      confirmPairing: (code) => {
        const cur = get().lovedOne;
        if (!cur) return false;
        const ok = code.trim().toUpperCase() === cur.pairingCode;
        if (ok) get().updateLovedOne({ paired: true });
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
        maybeSyncEvent(event, get().activeLovedOneId);
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

      // Append to the active recipient's thread, sender derived from this device's
      // current role. Local append is immediate; the remote push is best-effort and
      // never blocks (same fire-and-forget pattern as upsertRecipient/maybeSyncEvent).
      sendMessage: (body) => {
        const s = get();
        const trimmed = body.trim();
        if (!trimmed || !s.activeLovedOneId) return;
        const sender = s.role === 'senior' ? 'senior' : 'caregiver';
        const message: ChatMessage = {
          id: uid(),
          lovedOneId: s.activeLovedOneId,
          sender,
          body: trimmed,
          at: Date.now(),
        };
        set({ messages: [...s.messages, message] });
        sendMessageRemote(message);
        // A message from the senior is news for the caregiver's activity feed —
        // matches the convention already used for a manual dose-taken tap.
        if (sender === 'senior') {
          get().logEvent({
            kind: 'activity',
            severity: 'info',
            title: `${firstNameOf(s.lovedOne)} sent a message`,
            detail: trimmed,
          });
        }
      },

      // Poll for new messages since the last one we have locally, merged in by id.
      // Cloud-only (no-op when Supabase isn't configured); called on Chat screen
      // focus and piggybacked on SeniorHome's existing clock-tick interval.
      syncMessages: async () => {
        const s = get();
        if (!s.activeLovedOneId || !isSupabaseConfigured) return;
        const lastAt = s.messages.length ? s.messages[s.messages.length - 1].at : 0;
        const incoming = await fetchMessagesRemote(s.activeLovedOneId, lastAt);
        if (!incoming.length) return;
        set({ messages: mergeMessages(get().messages, incoming) });
      },

      markSeen: (role) => {
        const now = Date.now();
        if (role === 'senior') set({ lastSeenBySeniorAt: now });
        else set({ lastSeenByCaregiverAt: now });
      },

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
