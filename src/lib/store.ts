/**
 * The shared care store.
 *
 * In production the caregiver phone and the senior device are two separate
 * clients kept in sync through Supabase realtime (see lib/supabase.ts and the
 * schema in supabase/schema.sql). For this Expo Go MVP both surfaces read and
 * write one local, AsyncStorage-persisted store, so you can flip roles on a
 * single device and watch data flow end to end:
 *   caregiver logs a medication  ->  senior scans it  ->  caregiver sees the log.
 *
 * Every mutation here is written to be a drop-in for a Supabase call: same
 * shapes, same ids. `syncEvent()` is the one seam where you'd fan an event out
 * to the backend instead of (or in addition to) the local list.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  CareEvent,
  CareState,
  EventKind,
  EventSeverity,
  LovedOne,
  Medication,
  Role,
} from '../types';
import { maybeSyncEvent } from './supabase';

// How long the home can be quiet during waking hours before we flag a check-in.
export const SILENCE_THRESHOLD_HOURS = 6;
const WAKING_START = 7; // 7am
const WAKING_END = 22; // 10pm

const uid = () => Math.random().toString(36).slice(2, 10);
const code6 = () =>
  Math.random().toString(36).slice(2, 8).toUpperCase().replace(/[^A-Z0-9]/g, 'X');

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
  markActivity: () => void;
  setAmbientRunning: (v: boolean) => void;

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

      addMedication: (m) => set({ medications: [...get().medications, { ...m, id: uid() }] }),

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

      markActivity: () => set({ lastActivityAt: Date.now() }),
      setAmbientRunning: (v) => set({ ambientRunning: v }),

      sendCheckIn: (message) => set({ checkIn: message }),
      clearCheckIn: () => set({ checkIn: null }),

      seedDemo: () => {
        get().createLovedOne('Rose', 'Mother');
        const meds: Omit<Medication, 'id'>[] = [
          {
            name: 'Lisinopril',
            dosage: '10mg — 1 pill',
            schedule: 'morning',
            friendlyName: 'your blood pressure medicine',
            barcode: '036800111213',
          },
          {
            name: 'Metformin',
            dosage: '500mg — 1 pill',
            schedule: 'evening',
            friendlyName: 'your sugar medicine',
            barcode: '300450123458',
          },
          {
            name: 'Atorvastatin',
            dosage: '20mg — 1 pill',
            schedule: 'bedtime',
            friendlyName: 'your cholesterol medicine',
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
    },
  ),
);

export type StatusLevel = 'calm' | 'checkIn' | 'urgent';

/** Derived, low-noise status — the synthesized signal, not a data dump. */
export function computeStatus(state: CareState): {
  key: StatusLevel;
  reason: string;
} {
  const now = Date.now();
  const recent = state.events.filter((e) => now - e.at < 24 * 3600 * 1000);

  const urgent = recent.find((e) => e.severity === 'urgent');
  if (urgent) return { key: 'urgent', reason: urgent.title };

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

  return { key: 'calm', reason: 'Normal activity today' };
}
