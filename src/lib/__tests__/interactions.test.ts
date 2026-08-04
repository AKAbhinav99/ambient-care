import { checkInteractions, normalizeGeneric } from '../interactions';
import type { Medication } from '../../types';

const med = (over: Partial<Medication> & { name: string }): Medication => ({
  id: over.name,
  dosage: '1 pill',
  schedule: 'morning',
  friendlyName: `your ${over.name}`,
  ...over,
});

describe('checkInteractions', () => {
  test('flags warfarin + aspirin as a major bleeding interaction', () => {
    const w = checkInteractions([
      med({ name: 'Warfarin', genericName: 'warfarin' }),
      med({ name: 'Aspirin', genericName: 'aspirin' }),
    ]);
    expect(w.find((x) => x.severity === 'major' && x.kind === 'pair')).toBeDefined();
  });

  test('returns no interactions for a safe pair', () => {
    const w = checkInteractions([
      med({ name: 'Levothyroxine', genericName: 'levothyroxine' }),
      med({ name: 'Lisinopril', genericName: 'lisinopril' }),
    ]);
    expect(w).toHaveLength(0);
  });

  test('detects duplicate NSAID therapy', () => {
    const w = checkInteractions([
      med({ name: 'Ibuprofen', genericName: 'ibuprofen' }),
      med({ name: 'Naproxen', genericName: 'naproxen' }),
    ]);
    expect(w.some((x) => x.kind === 'duplicate')).toBe(true);
  });

  test('adds a grapefruit food caution for statins', () => {
    const w = checkInteractions([med({ name: 'Atorvastatin', genericName: 'atorvastatin' })]);
    expect(w.some((x) => x.kind === 'food' && /grapefruit/i.test(x.b))).toBe(true);
  });

  test('sorts major warnings ahead of moderate', () => {
    const w = checkInteractions([
      med({ name: 'Warfarin', genericName: 'warfarin' }),
      med({ name: 'Aspirin', genericName: 'aspirin' }),
      med({ name: 'Atorvastatin', genericName: 'atorvastatin' }),
    ]);
    expect(w[0].severity).toBe('major');
  });
});

describe('normalizeGeneric', () => {
  test('resolves a brand name to its generic', () => {
    expect(normalizeGeneric({ name: 'Lipitor' })).toBe('atorvastatin');
  });
  test('lowercases a plain generic name', () => {
    expect(normalizeGeneric({ name: 'Metformin' })).toBe('metformin');
  });
});
