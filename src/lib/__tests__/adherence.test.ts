import {
  medTimes,
  DEFAULT_TIMES,
  slotsForDay,
  resolveStatus,
  overdueUnmarked,
  adherenceStats,
  nearestSlot,
} from '../adherence';
import type { DoseLog, Medication } from '../../types';

const at = (h: number, m = 0) => new Date(2026, 0, 15, h, m, 0, 0).getTime();
const DAY_START = at(0);
const NOON = at(12);

const med = (over: Partial<Medication>): Medication => ({
  id: 'm1',
  name: 'Metformin',
  dosage: '1 pill',
  schedule: 'evening',
  friendlyName: 'your sugar medicine',
  createdAt: DAY_START, // tracked from the start of the test day
  ...over,
});

describe('medTimes', () => {
  test('falls back to the schedule default when no explicit times', () => {
    expect(medTimes(med({ schedule: 'morning', times: undefined }))).toEqual(DEFAULT_TIMES.morning);
  });
  test('uses explicit times when present', () => {
    expect(medTimes(med({ times: ['09:30'] }))).toEqual(['09:30']);
  });
});

describe('overdue detection', () => {
  const m = med({ id: 'm1', times: ['08:00'] });

  test('an untaken past-grace dose is overdue and resolves as missed', () => {
    expect(overdueUnmarked([m], [], NOON).some((s) => s.med.id === 'm1')).toBe(true);
    const slot = slotsForDay([m], NOON)[0];
    expect(resolveStatus(slot, [], NOON)).toBe('missed');
  });

  test('a taken log removes it from overdue', () => {
    const slot = slotsForDay([m], NOON)[0];
    const logs: DoseLog[] = [
      { id: 'l', medId: 'm1', scheduledAt: slot.scheduledAt, status: 'taken', source: 'manual' },
    ];
    expect(overdueUnmarked([m], logs, NOON)).toHaveLength(0);
    expect(resolveStatus(slot, logs, NOON)).toBe('taken');
  });

  test('a dose still inside its grace window resolves as due, not missed', () => {
    const m2 = med({ id: 'm2', times: ['11:00'] }); // 11:00 + 2h grace = 13:00 > NOON
    const slot = slotsForDay([m2], NOON)[0];
    expect(resolveStatus(slot, [], NOON)).toBe('due');
  });
});

describe('adherenceStats', () => {
  const m = med({ id: 'm1', times: ['08:00'] });

  test('counts a taken dose as 100% adherence', () => {
    const slot = slotsForDay([m], NOON)[0];
    const logs: DoseLog[] = [
      { id: 'l', medId: 'm1', scheduledAt: slot.scheduledAt, status: 'taken', source: 'scan' },
    ];
    const s = adherenceStats([m], logs, NOON, 1);
    expect(s.takenCount).toBe(1);
    expect(s.missedCount).toBe(0);
    expect(s.adherencePct).toBe(100);
  });

  test('a missed dose drops adherence to 0%', () => {
    const s = adherenceStats([m], [], NOON, 1);
    expect(s.missedCount).toBe(1);
    expect(s.adherencePct).toBe(0);
  });
});

describe('nearestSlot', () => {
  test('picks the closest scheduled time within the window', () => {
    const m = med({ id: 'm1', times: ['08:00', '18:00'] });
    expect(nearestSlot(m, NOON)).toBe(at(8)); // 08:00 is 4h away, 18:00 is 6h
  });
  test('returns undefined for an as-needed med with no times', () => {
    expect(nearestSlot(med({ schedule: 'asNeeded', times: [] }), NOON)).toBeUndefined();
  });
});
