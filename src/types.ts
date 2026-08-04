/** Shared domain types for both surfaces. */

export type Role = 'caregiver' | 'senior';

export interface LovedOne {
  id: string;
  name: string;
  relationship: string; // e.g. "Mother"
  pairingCode: string; // 6-char code the senior device shows / caregiver enters
  paired: boolean;
  ambientOptIn: boolean; // explicit consent to ambient audio monitoring
  alwaysOnMode: boolean; // "Always-on" (kiosk-ish) vs "Normal mode"
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
  | 'pairing';

export type EventSeverity = 'info' | 'checkIn' | 'urgent';

export interface CareEvent {
  id: string;
  kind: EventKind;
  severity: EventSeverity;
  title: string; // caregiver-facing one-liner
  detail?: string;
  at: number; // epoch ms
}

export interface CareState {
  role: Role | null;
  lovedOne: LovedOne | null;
  medications: Medication[];
  events: CareEvent[]; // newest first
  lastActivityAt: number | null;
  ambientRunning: boolean;
  checkIn: string | null; // a warm note the caregiver sent, awaiting the senior
}
