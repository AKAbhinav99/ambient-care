/**
 * Supabase client — the production backend seam.
 *
 * The app runs fully offline on the local store by default, so nothing here is
 * required to demo. Provide credentials to light up real cross-device sync:
 *
 *   1. Create a free project at https://supabase.com
 *   2. Run supabase/schema.sql in the SQL editor
 *   3. Add to a .env file at the project root:
 *        EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
 *        EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhb....
 *   4. Restart with `npx expo start -c`
 *
 * When configured, care events are inserted into `care_events`. The caregiver
 * dashboard would then subscribe via supabase.channel(...).on('postgres_changes')
 * instead of reading the local list — that swap is the only wiring left.
 */

import 'react-native-url-polyfill/auto';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { CareEvent } from '../types';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string, {
      auth: { persistSession: false },
    })
  : null;

/** Fire-and-forget push of an event to the backend when configured. */
export async function maybeSyncEvent(event: CareEvent): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.from('care_events').insert({
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
