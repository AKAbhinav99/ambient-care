import { refillStatus, lowRefills } from '../refill';
import type { Medication } from '../../types';

const med = (over: Partial<Medication>): Medication => ({
  id: 'm1',
  name: 'Metformin',
  dosage: '1 pill',
  schedule: 'evening',
  friendlyName: 'your sugar medicine',
  ...over,
});

const NOW = new Date(2026, 0, 15, 12).getTime();

describe('refillStatus', () => {
  test('predicts days left and flags low supply', () => {
    const rs = refillStatus(med({ times: ['08:00', '18:00'], pillsOnHand: 9, refillThreshold: 10 }), NOW);
    expect(rs).not.toBeNull();
    expect(rs!.perDay).toBe(2);
    expect(rs!.daysLeft).toBe(4); // floor(9 / 2)
    expect(rs!.low).toBe(true);
  });

  test('returns null when supply is not tracked', () => {
    expect(refillStatus(med({}), NOW)).toBeNull();
  });

  test('is not low when well above threshold', () => {
    const rs = refillStatus(med({ times: ['08:00'], pillsOnHand: 60, refillThreshold: 5 }), NOW);
    expect(rs!.low).toBe(false);
  });
});

describe('lowRefills', () => {
  test('returns only the medications running low', () => {
    const low = lowRefills(
      [
        med({ id: 'a', times: ['08:00'], pillsOnHand: 2, refillThreshold: 5 }),
        med({ id: 'b', times: ['08:00'], pillsOnHand: 50, refillThreshold: 5 }),
      ],
      NOW,
    );
    expect(low).toHaveLength(1);
    expect(low[0].med.id).toBe('a');
  });
});
