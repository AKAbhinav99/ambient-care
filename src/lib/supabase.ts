/**
 * Supabase client — the production backend seam.
 *
 * The app runs fully on the local store by default (single device, offline), so
 * nothing here is required to demo. Provide credentials to light up real accounts
 * and cross-device sync:
 *
 *   1. Create a free project at https://supabase.com
 *   2. Run supabase/schema.sql in the SQL editor
 *   3. Add to a .env file at the project root:
 *        EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
 *        EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhb....
 *   4. Restart with `npx expo start -c`
 *
 * When configured: caregiver auth is real (see lib/auth.ts), the recipient roster
 * + join codes live in `loved_ones`, the unauthenticated home device binds to a
 * recipient via the `redeem_code` RPC, care events stream to `care_events`, and
 * chat messages sync via the `send_message`/`fetch_messages` RPCs (see lib/chat.ts
 * for why this is polling rather than a Realtime subscription).
 */

import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { CareEvent, ChatMessage, LovedOne, MessageSender } from '../types';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string, {
      auth: {
        storage: AsyncStorage,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    })
  : null;

// --- Row <-> LovedOne mapping (snake_case DB columns <-> camelCase app model) ---

type Row = Record<string, unknown>;

function str(v: unknown): string | undefined {
  return typeof v === 'string' && v.length ? v : undefined;
}

function rowToLovedOne(r: Row): LovedOne {
  return {
    id: String(r.id),
    name: String(r.name ?? ''),
    relationship: String(r.relationship ?? ''),
    caregiverId: str(r.caregiver_id),
    pairingCode: String(r.pairing_code ?? ''),
    paired: Boolean(r.paired),
    ambientOptIn: Boolean(r.ambient_opt_in),
    alwaysOnMode: r.always_on_mode == null ? true : Boolean(r.always_on_mode),
    language: str(r.language) as LovedOne['language'],
    voiceId: str(r.voice_id),
    voiceRegion: str(r.voice_region),
    speechRate: typeof r.speech_rate === 'number' ? r.speech_rate : undefined,
    dob: str(r.dob),
    bloodType: str(r.blood_type),
    allergies: Array.isArray(r.allergies) ? (r.allergies as string[]) : undefined,
    conditions: Array.isArray(r.conditions) ? (r.conditions as string[]) : undefined,
    emergencyContacts: Array.isArray(r.emergency_contacts)
      ? (r.emergency_contacts as LovedOne['emergencyContacts'])
      : undefined,
    doctor: str(r.doctor),
    pharmacy: str(r.pharmacy),
    medicalNotes: str(r.medical_notes),
    dyslexiaFont: typeof r.dyslexia_font === 'boolean' ? r.dyslexia_font : undefined,
    colorScheme: str(r.color_scheme) as LovedOne['colorScheme'],
  };
}

function lovedOneToRow(l: LovedOne): Row {
  return {
    id: l.id,
    caregiver_id: l.caregiverId ?? null,
    name: l.name,
    relationship: l.relationship,
    pairing_code: l.pairingCode,
    paired: l.paired,
    ambient_opt_in: l.ambientOptIn,
    always_on_mode: l.alwaysOnMode,
    language: l.language ?? null,
    voice_id: l.voiceId ?? null,
    voice_region: l.voiceRegion ?? null,
    speech_rate: l.speechRate ?? null,
    dob: l.dob ?? null,
    blood_type: l.bloodType ?? null,
    allergies: l.allergies ?? null,
    conditions: l.conditions ?? null,
    emergency_contacts: l.emergencyContacts ?? null,
    doctor: l.doctor ?? null,
    pharmacy: l.pharmacy ?? null,
    medical_notes: l.medicalNotes ?? null,
    dyslexia_font: l.dyslexiaFont ?? null,
    color_scheme: l.colorScheme ?? null,
  };
}

/** All care recipients owned by the signed-in caregiver. Empty when unconfigured. */
export async function fetchRoster(caregiverId: string): Promise<LovedOne[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase.from('loved_ones').select('*').eq('caregiver_id', caregiverId);
    if (error || !data) return [];
    return (data as Row[]).map(rowToLovedOne);
  } catch (err) {
    console.warn('[supabase] fetchRoster failed (running local-only):', err);
    return [];
  }
}

/** Create/update a recipient row (best-effort; the local store is source of truth). */
export async function upsertRecipient(lovedOne: LovedOne): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.from('loved_ones').upsert(lovedOneToRow(lovedOne));
  } catch (err) {
    console.warn('[supabase] upsertRecipient failed (running local-only):', err);
  }
}

/**
 * Redeem a join code from the (unauthenticated) home device. Calls the
 * `redeem_code` SECURITY DEFINER RPC, which returns the recipient and marks it
 * paired. Returns null when unconfigured or the code is unknown.
 */
export async function redeemCode(code: string): Promise<LovedOne | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.rpc('redeem_code', { code });
    if (error || !data) return null;
    const row = (Array.isArray(data) ? data[0] : data) as Row | undefined;
    return row ? rowToLovedOne(row) : null;
  } catch (err) {
    console.warn('[supabase] redeemCode failed:', err);
    return null;
  }
}

function rowToMessage(r: Row): ChatMessage {
  return {
    id: String(r.id),
    lovedOneId: String(r.loved_one_id ?? ''),
    sender: (r.sender === 'senior' ? 'senior' : 'caregiver') as MessageSender,
    body: String(r.body ?? ''),
    at: r.occurred_at ? new Date(r.occurred_at as string).getTime() : Date.now(),
  };
}

/**
 * Send a chat message via the `send_message` SECURITY DEFINER RPC — used by both
 * roles (the home device has no account, so a plain authenticated insert won't
 * work for it; going through the same RPC for both sides keeps one code path).
 * Fire-and-forget: the local store already appended the message optimistically.
 */
export async function sendMessageRemote(message: ChatMessage): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.rpc('send_message', {
      p_loved_one_id: message.lovedOneId,
      p_sender: message.sender,
      p_body: message.body,
    });
  } catch (err) {
    console.warn('[supabase] sendMessageRemote failed (running local-only):', err);
  }
}

/** Poll for messages newer than `sinceAt` (epoch ms) via the `fetch_messages` RPC. */
export async function fetchMessagesRemote(lovedOneId: string, sinceAt: number): Promise<ChatMessage[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase.rpc('fetch_messages', {
      p_loved_one_id: lovedOneId,
      p_since: new Date(sinceAt).toISOString(),
    });
    if (error || !data) return [];
    return (data as Row[]).map(rowToMessage);
  } catch (err) {
    console.warn('[supabase] fetchMessagesRemote failed:', err);
    return [];
  }
}

/** Fire-and-forget push of an event to the backend when configured. */
export async function maybeSyncEvent(event: CareEvent, lovedOneId?: string | null): Promise<void> {
  if (!supabase || !lovedOneId) return;
  try {
    await supabase.from('care_events').insert({
      loved_one_id: lovedOneId,
      kind: event.kind,
      severity: event.severity,
      title: event.title,
      detail: event.detail ?? null,
      occurred_at: new Date(event.at).toISOString(),
    });
  } catch (err) {
    // Never let a sync failure break the local experience.
    console.warn('[supabase] event sync failed (running local-only):', err);
  }
}
