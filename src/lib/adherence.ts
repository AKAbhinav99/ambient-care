/**
 * Dose scheduling + adherence math.
 *
 * A "dose slot" is a (medication, scheduled time) pair generated from each med's
 * `times[]` for a given day. A `DoseLog` records what became of a slot. These are
 * all pure functions over plain arrays so the store can call them and tests can
 * exercise them without React. `scheduledAt` is computed deterministically (a day
 * at HH:mm, local time) so the same slot resolves to the same epoch when we read it
 * and when we mark it taken.
 */

import type { DoseLog, DoseStatus, MedSchedule, Medication } from '../types';

/** How long after a dose time before an untaken dose counts as missed. */
export const GRACE_MS = 2 * 60 * 60 * 1000; // 2 hours

const DAY_MS = 24 * 60 * 60 * 1000;

/** Default clock times inferred from the coarse schedule label. */
export const DEFAULT_TIMES: Record<MedSchedule, string[]> = {
  morning: ['08:00'],
  midday: ['12:00'],
  evening: ['18:00'],
  bedtime: ['21:00'],
  asNeeded: [],
};

export function medTimes(med: Medication): string[] {
  if (med.times && med.times.length) return med.times;
  return DEFAULT_TIMES[med.schedule] ?? [];
}

export interface DoseSlot {
  med: Medication;
  scheduledAt: number;
  time: string; // HH:mm
}

export type ResolvedStatus = DoseStatus | 'upcoming' | 'due';

export interface DoseView extends DoseSlot {
  status: ResolvedStatus;
}

function atTimeOnDay(day: Date, hhmm: string): number {
  const [h, m] = hhmm.split(':').map((n) => Number(n));
  const d = new Date(day);
  d.setHours(h || 0, m || 0, 0, 0);
  return d.getTime();
}

function startOfDay(ts: number): Date {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * All scheduled dose slots for the calendar day containing `dayTs`. Slots earlier
 * than a med's `createdAt` are omitted — we never judge doses from before the med
 * was being tracked (which would otherwise flag phantom "missed" doses on add).
 */
export function slotsForDay(meds: Medication[], dayTs: number): DoseSlot[] {
  const day = startOfDay(dayTs);
  const slots: DoseSlot[] = [];
  for (const med of meds) {
    for (const time of medTimes(med)) {
      const scheduledAt = atTimeOnDay(day, time);
      if (med.createdAt != null && scheduledAt < med.createdAt) continue;
      slots.push({ med, time, scheduledAt });
    }
  }
  return slots.sort((a, b) => a.scheduledAt - b.scheduledAt);
}

function findLog(logs: DoseLog[], medId: string, scheduledAt: number): DoseLog | undefined {
  return logs.find((l) => l.medId === medId && l.scheduledAt === scheduledAt);
}

/** Resolve a slot to a concrete status, materialized or computed. */
export function resolveStatus(
  slot: DoseSlot,
  logs: DoseLog[],
  now: number,
  graceMs = GRACE_MS,
): ResolvedStatus {
  const log = findLog(logs, slot.med.id, slot.scheduledAt);
  if (log) return log.status;
  if (now < slot.scheduledAt) return 'upcoming';
  if (now < slot.scheduledAt + graceMs) return 'due';
  return 'missed';
}

/** Today's doses with resolved status, for the senior prompt + summaries. */
export function todaysDoses(meds: Medication[], logs: DoseLog[], now: number): DoseView[] {
  return slotsForDay(meds, now).map((slot) => ({ ...slot, status: resolveStatus(slot, logs, now) }));
}

/** Doses whose window is open right now and still un-acted (for "Time for your pills"). */
export function dueDoses(meds: Medication[], logs: DoseLog[], now: number, graceMs = GRACE_MS): DoseSlot[] {
  return slotsForDay(meds, now).filter((slot) => {
    if (findLog(logs, slot.med.id, slot.scheduledAt)) return false;
    return now >= slot.scheduledAt && now < slot.scheduledAt + graceMs;
  });
}

/** Doses past their grace window with no record — reconcile marks these missed. */
export function overdueUnmarked(
  meds: Medication[],
  logs: DoseLog[],
  now: number,
  graceMs = GRACE_MS,
): DoseSlot[] {
  // Look back a couple of days so a phone that was closed still catches misses.
  const out: DoseSlot[] = [];
  for (let d = 0; d <= 2; d++) {
    for (const slot of slotsForDay(meds, now - d * DAY_MS)) {
      if (now < slot.scheduledAt + graceMs) continue;
      if (findLog(logs, slot.med.id, slot.scheduledAt)) continue;
      out.push(slot);
    }
  }
  return out;
}

/**
 * The slot a scan/manual "taken" should attach to: today's slot for this med
 * closest to `now` within `windowMs`. Returns undefined for as-needed meds.
 */
export function nearestSlot(med: Medication, now: number, windowMs = 6 * 60 * 60 * 1000): number | undefined {
  const slots = slotsForDay([med], now);
  if (!slots.length) return undefined;
  let best: number | undefined;
  let bestDist = Infinity;
  for (const s of slots) {
    const dist = Math.abs(s.scheduledAt - now);
    if (dist < bestDist) {
      bestDist = dist;
      best = s.scheduledAt;
    }
  }
  return best !== undefined && bestDist <= windowMs ? best : undefined;
}

export interface MedAdherence {
  med: Medication;
  taken: number;
  missed: number;
  adherencePct: number;
}

export interface AdherenceStats {
  scheduledCount: number;
  takenCount: number;
  missedCount: number;
  skippedCount: number;
  dueCount: number;
  upcomingCount: number;
  adherencePct: number; // taken / (taken + missed)
  currentStreak: number; // consecutive on-track days ending today
  byMed: MedAdherence[];
}

/** Adherence over the last `days` days (inclusive of today). */
export function adherenceStats(
  meds: Medication[],
  logs: DoseLog[],
  now: number,
  days = 7,
): AdherenceStats {
  let taken = 0;
  let missed = 0;
  let skipped = 0;
  let due = 0;
  let upcoming = 0;
  let scheduled = 0;
  const perMed = new Map<string, { taken: number; missed: number }>();

  for (let d = 0; d < days; d++) {
    for (const slot of slotsForDay(meds, now - d * DAY_MS)) {
      scheduled++;
      const status = resolveStatus(slot, logs, now);
      const bucket = perMed.get(slot.med.id) ?? { taken: 0, missed: 0 };
      if (status === 'taken') {
        taken++;
        bucket.taken++;
      } else if (status === 'missed') {
        missed++;
        bucket.missed++;
      } else if (status === 'skipped') {
        skipped++;
      } else if (status === 'due') {
        due++;
      } else {
        upcoming++;
      }
      perMed.set(slot.med.id, bucket);
    }
  }

  const denom = taken + missed;
  const adherencePct = denom > 0 ? Math.round((100 * taken) / denom) : 100;

  const byMed: MedAdherence[] = meds.map((med) => {
    const b = perMed.get(med.id) ?? { taken: 0, missed: 0 };
    const d = b.taken + b.missed;
    return { med, taken: b.taken, missed: b.missed, adherencePct: d > 0 ? Math.round((100 * b.taken) / d) : 100 };
  });

  return {
    scheduledCount: scheduled,
    takenCount: taken,
    missedCount: missed,
    skippedCount: skipped,
    dueCount: due,
    upcomingCount: upcoming,
    adherencePct,
    currentStreak: computeStreak(meds, logs, now),
    byMed,
  };
}

/** Consecutive days (ending today) with at least one dose and zero misses. */
function computeStreak(meds: Medication[], logs: DoseLog[], now: number): number {
  let streak = 0;
  for (let d = 0; d < 60; d++) {
    const dayTs = now - d * DAY_MS;
    const slots = slotsForDay(meds, dayTs);
    if (!slots.length) {
      if (d === 0) continue; // today may have no doses yet; keep looking back
      break;
    }
    let dayMissed = 0;
    let resolvedAny = false;
    for (const slot of slots) {
      const status = resolveStatus(slot, logs, now);
      if (status === 'missed') dayMissed++;
      if (status === 'taken' || status === 'missed' || status === 'skipped') resolvedAny = true;
    }
    if (dayMissed > 0) break;
    if (resolvedAny) streak++;
    else if (d > 0) break; // a fully-upcoming past day shouldn't happen; stop
  }
  return streak;
}
