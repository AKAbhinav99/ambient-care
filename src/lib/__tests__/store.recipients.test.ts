// The store pulls in native-backed modules (Supabase, notifications, AsyncStorage);
// mock them so the pure multi-recipient logic is exercisable in node.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('../supabase', () => ({
  isSupabaseConfigured: false,
  maybeSyncEvent: jest.fn(),
  redeemCode: jest.fn(async () => null),
  upsertRecipient: jest.fn(),
  fetchRoster: jest.fn(async () => []),
}));
jest.mock('../auth', () => ({ signOut: jest.fn() }));
jest.mock('../notifications', () => ({
  fireAlert: jest.fn(),
  scheduleDoseReminders: jest.fn(),
  scheduleDailyDigest: jest.fn(),
  buildDigest: jest.fn(() => ''),
}));
jest.mock('../escalation', () => ({ scheduleEscalation: jest.fn(), cancelEscalation: jest.fn() }));

import { useStore } from '../store';
import type { Medication } from '../../types';

const med = (name: string): Omit<Medication, 'id'> => ({
  name,
  dosage: '1 pill',
  schedule: 'morning',
  friendlyName: `your ${name}`,
});

beforeEach(() => {
  // Full reset between tests.
  useStore.getState().signOutAccount();
});

describe('multi-recipient roster', () => {
  test('createLovedOne adds to the roster, activates it, and issues a code', () => {
    const s = useStore.getState();
    s.createLovedOne('Rose', 'Mother');
    const after = useStore.getState();
    expect(after.roster).toHaveLength(1);
    expect(after.lovedOne?.name).toBe('Rose');
    expect(after.activeLovedOneId).toBe(after.roster[0].id);
    expect(after.lovedOne?.pairingCode).toMatch(/^[A-Z0-9]{6}$/);
  });

  test('each recipient owns its own medications (isolation across switches)', () => {
    const s = useStore.getState();
    s.createLovedOne('Rose', 'Mother');
    const roseId = useStore.getState().activeLovedOneId!;
    useStore.getState().addMedication(med('Lisinopril'));

    s.createLovedOne('Bill', 'Father');
    const billId = useStore.getState().activeLovedOneId!;
    useStore.getState().addMedication(med('Metformin'));

    expect(roseId).not.toBe(billId);

    useStore.getState().setActiveRecipient(roseId);
    expect(useStore.getState().medications.map((m) => m.name)).toEqual(['Lisinopril']);

    useStore.getState().setActiveRecipient(billId);
    expect(useStore.getState().medications.map((m) => m.name)).toEqual(['Metformin']);
  });

  test('updateLovedOne edits the active recipient and its roster entry together', () => {
    const s = useStore.getState();
    s.createLovedOne('Rose', 'Mother');
    useStore.getState().updateLovedOne({ language: 'es' });
    const after = useStore.getState();
    expect(after.lovedOne?.language).toBe('es');
    expect(after.roster[0].language).toBe('es');
  });
});

describe('bindByCode (home device)', () => {
  test('binds to a recipient found in the local roster', async () => {
    const s = useStore.getState();
    s.createLovedOne('Rose', 'Mother');
    const code = useStore.getState().roster[0].pairingCode;

    const ok = await useStore.getState().bindByCode(code.toLowerCase()); // case-insensitive
    expect(ok).toBe(true);
    const after = useStore.getState();
    expect(after.role).toBe('senior');
    expect(after.seniorBoundId).toBe(after.roster[0].id);
    expect(after.lovedOne?.name).toBe('Rose');
    expect(after.lovedOne?.paired).toBe(true);
  });

  test('returns false for an unknown code', async () => {
    const ok = await useStore.getState().bindByCode('NOPE12');
    expect(ok).toBe(false);
    expect(useStore.getState().role).toBeNull();
  });

  test('binding to the already-active recipient keeps its live meds', async () => {
    const s = useStore.getState();
    s.createLovedOne('Rose', 'Mother');
    useStore.getState().addMedication(med('Lisinopril'));
    const code = useStore.getState().roster[0].pairingCode; // Rose is still active
    const ok = await useStore.getState().bindByCode(code);
    expect(ok).toBe(true);
    expect(useStore.getState().medications.map((m) => m.name)).toEqual(['Lisinopril']);
    expect(useStore.getState().seniorBoundId).toBe(useStore.getState().roster[0].id);
  });
});
