/**
 * Caregiver authentication via Supabase Auth.
 *
 * Only the caregiver signs in; the home (senior) device is never authenticated —
 * it binds to a recipient with a join code (see redeemCode in lib/supabase.ts).
 * Every call is a no-op returning `not-configured` when Supabase keys are absent,
 * so the UI can show a setup state instead of crashing.
 */

import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';
import type { Account } from '../types';

export interface AuthResult {
  ok: boolean;
  needsConfirmation?: boolean; // email confirmation is required before a session exists
  error?: string;
  account?: Account;
}

function accountFromUser(user: User, fallbackName?: string): Account {
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const name = typeof meta.name === 'string' && meta.name ? meta.name : fallbackName ?? '';
  return { id: user.id, name, email: user.email ?? '' };
}

function message(err: unknown): string {
  return err instanceof Error ? err.message : 'Something went wrong. Please try again.';
}

export async function signUp(name: string, email: string, password: string): Promise<AuthResult> {
  if (!supabase) return { ok: false, error: 'not-configured' };
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { name: name.trim() } },
    });
    if (error) return { ok: false, error: error.message };
    // With email confirmation on, there's no session until the user confirms.
    if (!data.session || !data.user) return { ok: true, needsConfirmation: true };
    return { ok: true, account: accountFromUser(data.user, name.trim()) };
  } catch (err) {
    return { ok: false, error: message(err) };
  }
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  if (!supabase) return { ok: false, error: 'not-configured' };
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) return { ok: false, error: error.message };
    if (!data.user) return { ok: false, error: 'Sign-in failed. Please try again.' };
    return { ok: true, account: accountFromUser(data.user) };
  } catch (err) {
    return { ok: false, error: message(err) };
  }
}

export async function signOut(): Promise<void> {
  try {
    await supabase?.auth.signOut();
  } catch {
    // Ignore — the store clears the local account regardless.
  }
}

/** The account for the currently persisted session, or null. */
export async function currentAccount(): Promise<Account | null> {
  if (!supabase) return null;
  try {
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;
    return user ? accountFromUser(user) : null;
  } catch {
    return null;
  }
}

/** Subscribe to sign-in/out; returns an unsubscribe fn. No-op when unconfigured. */
export function subscribeAuth(onChange: (account: Account | null) => void): () => void {
  if (!supabase) return () => {};
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    onChange(session?.user ? accountFromUser(session.user) : null);
  });
  return () => data.subscription.unsubscribe();
}
