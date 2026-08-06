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
  sendMessageRemote: jest.fn(),
  fetchMessagesRemote: jest.fn(async () => []),
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

describe('chat', () => {
  test('sendMessage appends to the active recipient thread, sender from role', () => {
    const s = useStore.getState();
    s.setRole('caregiver');
    s.createLovedOne('Rose', 'Mother');
    useStore.getState().sendMessage('Thinking of you today');
    const after = useStore.getState();
    expect(after.messages).toHaveLength(1);
    expect(after.messages[0]).toMatchObject({ sender: 'caregiver', body: 'Thinking of you today' });
  });

  test('a message from the senior is logged to the activity feed', () => {
    const s = useStore.getState();
    s.createLovedOne('Rose', 'Mother');
    useStore.getState().setRole('senior');
    useStore.getState().sendMessage("I'm doing great today");
    const after = useStore.getState();
    expect(after.events[0]).toMatchObject({ kind: 'activity', detail: "I'm doing great today" });
  });

  test('a message from the caregiver is not logged to the activity feed', () => {
    const s = useStore.getState();
    s.setRole('caregiver');
    s.createLovedOne('Rose', 'Mother');
    useStore.getState().sendMessage('hello');
    expect(useStore.getState().events).toHaveLength(0);
  });

  test('blank messages are ignored', () => {
    const s = useStore.getState();
    s.createLovedOne('Rose', 'Mother');
    useStore.getState().sendMessage('   ');
    expect(useStore.getState().messages).toHaveLength(0);
  });

  test('each recipient has its own thread (isolation across switches)', () => {
    const s = useStore.getState();
    s.createLovedOne('Rose', 'Mother');
    const roseId = useStore.getState().activeLovedOneId!;
    useStore.getState().sendMessage('hi Rose');

    s.createLovedOne('Bill', 'Father');
    const billId = useStore.getState().activeLovedOneId!;
    useStore.getState().sendMessage('hi Bill');

    useStore.getState().setActiveRecipient(roseId);
    expect(useStore.getState().messages.map((m) => m.body)).toEqual(['hi Rose']);

    useStore.getState().setActiveRecipient(billId);
    expect(useStore.getState().messages.map((m) => m.body)).toEqual(['hi Bill']);
  });

  test('markSeen stamps the right per-role timestamp', () => {
    const s = useStore.getState();
    s.createLovedOne('Rose', 'Mother');
    expect(useStore.getState().lastSeenBySeniorAt).toBeNull();
    useStore.getState().markSeen('senior');
    expect(useStore.getState().lastSeenBySeniorAt).not.toBeNull();
    expect(useStore.getState().lastSeenByCaregiverAt).toBeNull();
  });
});
