/** Shared domain types for both surfaces. */

import type { LangCode } from './i18n/config';
import type { ColorScheme } from './theme/tokens';

export type Role = 'caregiver' | 'senior';

/** The signed-in caregiver. `local` marks the no-Supabase demo bypass. */
export interface Account {
  id: string;
  name: string;
  email: string;
  local?: boolean;
}

export type AuthStatus = 'unknown' | 'signedOut' | 'signedIn';

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface LovedOne {
  id: string;
  name: string;
  relationship: string; // e.g. "Mother"
  caregiverId?: string; // owning caregiver account (Supabase user id) when signed in
  pairingCode: string; // 6-char code the home device enters to bind to this recipient
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

export type MessageSender = 'caregiver' | 'senior';

/** One chat message in a recipient's thread with their caregiver. */
export interface ChatMessage {
  id: string;
  lovedOneId: string;
  sender: MessageSender;
  body: string;
  at: number; // epoch ms
}

/** One care recipient's data slice, held keyed by recipient id in the store. */
export interface RecipientData {
  medications: Medication[];
  doseLogs: DoseLog[];
  events: CareEvent[];
  lastActivityAt: number | null;
  messages: ChatMessage[];
  lastSeenBySeniorAt: number | null;
  lastSeenByCaregiverAt: number | null;
}

export interface CareState {
  role: Role | null;

  // --- Auth (caregiver) ---
  account: Account | null;
  authStatus: AuthStatus;

  // --- Multi-recipient roster + the active recipient's live slice ---
  // The "active mirror": lovedOne/medications/doseLogs/events/lastActivityAt/messages
  // below are always the ACTIVE recipient's data, so the existing screens are
  // unchanged. `recipients` holds every other recipient's slice, keyed by id.
  roster: LovedOne[];
  activeLovedOneId: string | null;
  recipients: Record<string, RecipientData>;
  // The home (senior) device's bound recipient, set by entering a join code.
  // Distinct from activeLovedOneId (the caregiver's current selection) because a
  // single Expo Go device shares one store across both roles.
  seniorBoundId: string | null;

  lovedOne: LovedOne | null;
  medications: Medication[];
  events: CareEvent[]; // newest first
  doseLogs: DoseLog[]; // dose history, newest first
  lastActivityAt: number | null;
  ambientRunning: boolean;
  messages: ChatMessage[]; // the active recipient's chat thread, oldest first
  lastSeenBySeniorAt: number | null;
  lastSeenByCaregiverAt: number | null;
}
