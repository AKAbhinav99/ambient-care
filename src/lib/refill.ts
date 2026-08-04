/**
 * Refill prediction.
 *
 * We track `pillsOnHand` per med (decremented in the store when a dose is taken)
 * and project a run-out date from how many doses that med has per day. A med is
 * "low" once its supply drops to/below `refillThreshold` (defaulting to ~5 days).
 */

import type { Medication } from '../types';
import { medTimes } from './adherence';

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_LOW_DAYS = 5;

export interface RefillStatus {
  med: Medication;
  pillsOnHand: number;
  perDay: number;
  daysLeft: number | null;
  runOutAt: number | null;
  threshold: number;
  low: boolean;
}

function thresholdFor(med: Medication, perDay: number): number {
  if (typeof med.refillThreshold === 'number') return med.refillThreshold;
  return Math.max(1, perDay * DEFAULT_LOW_DAYS);
}

export function refillStatus(med: Medication, now: number): RefillStatus | null {
  if (typeof med.pillsOnHand !== 'number') return null;
  const perDay = medTimes(med).length;
  const threshold = thresholdFor(med, perDay);
  const daysLeft = perDay > 0 ? Math.floor(med.pillsOnHand / perDay) : null;
  const runOutAt = daysLeft !== null ? now + daysLeft * DAY_MS : null;
  return {
    med,
    pillsOnHand: med.pillsOnHand,
    perDay,
    daysLeft,
    runOutAt,
    threshold,
    low: med.pillsOnHand <= threshold,
  };
}

export function refillStatuses(meds: Medication[], now: number): RefillStatus[] {
  return meds
    .map((m) => refillStatus(m, now))
    .filter((r): r is RefillStatus => r !== null);
}

export function lowRefills(meds: Medication[], now: number): RefillStatus[] {
  return refillStatuses(meds, now).filter((r) => r.low);
}
