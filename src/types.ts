/** Shared domain types for both surfaces. */

import type { LangCode } from './i18n/config';
import type { ColorScheme } from './theme/tokens';

export type Role = 'caregiver' | 'senior';

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface LovedOne {
  id: string;
  name: string;
  relationship: string; // e.g. "Mother"
  pairingCode: string; // 6-char code the senior device shows / caregiver enters
  paired: boolean;
  ambientOptIn: boolean; // explicit consent to ambient audio monitoring
  alwaysOnMode: boolean; // "Always-on" (kiosk-ish) vs "Normal mode"

  // --- Language & voice (senior surface) ---
  language?: LangCode; // localized senior UI + spoken output; defaults to English
  voiceId?: string; // chosen expo-speech voice identifier (accent + gender)
  voiceRegion?: string; // BCP-47 tag of the chosen voice, e.g. "es-MX"
  speechRate?: number; // spoken rate override (defaults to 0.92)

  // --- Accessibility (senior surface) ---
  dyslexiaFont?: boolean; // easy-read font (Atkinson Hyperlegible) + wider tracking
  colorScheme?: ColorScheme; // color-blind-friendly status palette

  // --- Medical profile (powers the Emergency Med Card) ---
  dob?: string; // ISO date; age is derived
  bloodType?: string; // "O+", "AB-", …
  allergies?: string[]; // drug/food allergies — shown in red
  conditions?: string[]; // chronic conditions
  emergencyContacts?: EmergencyContact[];
  doctor?: string; // "Dr. Ede — (512) 555-0110"
  pharmacy?: string; // "CVS on Main — (512) 555-0170"
  medicalNotes?: string; // freeform (e.g. "pacemaker since 2019")
}

export type MedSchedule = 'morning' | 'midday' | 'evening' | 'bedtime' | 'asNeeded';

export interface Medication {
  id: string;
  name: string;
  dosage: string; // "10mg, 1 pill"
  schedule: MedSchedule;
  friendlyName: string; // spoken back: "your blood pressure medicine"
  barcode?: string; // scanned barcode to match against (real, works in Expo Go)
  photoUri?: string; // optional photo of the pill/bottle

  genericName?: string; // normalized key for interaction lookup ("lisinopril")
  times?: string[]; // HH:mm dose times; defaulted from `schedule`
  critical?: boolean; // missing this dose escalates to urgent
  pillsOnHand?: number; // remaining supply, for refill prediction
  refillThreshold?: number; // alert when pillsOnHand drops to/below this
  createdAt?: number; // epoch ms the med was added; doses before this aren't judged
}

export type DoseStatus = 'taken' | 'missed' | 'skipped';

/** One scheduled dose and what became of it. */
export interface DoseLog {
  id: string;
  medId: string;
  scheduledAt: number; // epoch ms of the intended dose time
  status: DoseStatus;
  takenAt?: number; // epoch ms when actually taken
  source: 'scan' | 'manual' | 'auto'; // how the status was recorded
}

export type EventKind =
  | 'scan_match'
  | 'scan_mismatch'
  | 'voice_distress' // "I don't feel good"
  | 'voice_call' // "call my daughter"
  | 'voice_meds' // "what pills do I take"
  | 'loud_sound' // possible fall/crash
  | 'silence_anomaly' // no activity for X hours
  | 'activity' // heartbeat: any detected activity
  | 'missed_dose' // a scheduled dose lapsed untaken
  | 'refill_low' // a medication is running low
  | 'pairing';

export type EventSeverity = 'info' | 'checkIn' | 'urgent';

export interface CareEvent {
  id: string;
  kind: EventKind;
  severity: EventSeverity;
  title: string; // caregiver-facing one-liner
  detail?: string;
  at: number; // epoch ms
  acknowledgedAt?: number; // set when a caregiver acknowledges (stops escalation)
}

export interface CareState {
  role: Role | null;
  lovedOne: LovedOne | null;
  medications: Medication[];
  events: CareEvent[]; // newest first
  doseLogs: DoseLog[]; // dose history, newest first
  lastActivityAt: number | null;
  ambientRunning: boolean;
  checkIn: string | null; // a warm note the caregiver sent, awaiting the senior
}
