import { mergeMessages, latestUnseenFrom, hasUnseenFrom } from '../chat';
import type { ChatMessage } from '../../types';

const msg = (id: string, sender: ChatMessage['sender'], at: number, body = id): ChatMessage => ({
  id,
  lovedOneId: 'rose',
  sender,
  body,
  at,
});

describe('mergeMessages', () => {
  test('returns local unchanged when there is nothing incoming', () => {
    const local = [msg('a', 'caregiver', 1)];
    expect(mergeMessages(local, [])).toBe(local);
  });

  test('appends new incoming messages, sorted oldest-first', () => {
    const local = [msg('a', 'caregiver', 1)];
    const incoming = [msg('c', 'senior', 30), msg('b', 'caregiver', 20)];
    const merged = mergeMessages(local, incoming);
    expect(merged.map((m) => m.id)).toEqual(['a', 'b', 'c']);
  });

  test('deduplicates by id — a message already sent locally is not doubled by the poll', () => {
    const local = [msg('a', 'senior', 1, 'hello')];
    const incoming = [msg('a', 'senior', 1, 'hello')];
    const merged = mergeMessages(local, incoming);
    expect(merged).toHaveLength(1);
  });

  test('incoming wins on id collision (the server copy is authoritative)', () => {
    const local = [msg('a', 'senior', 1, 'draft-ish local copy')];
    const incoming = [msg('a', 'senior', 1, 'server copy')];
    const merged = mergeMessages(local, incoming);
    expect(merged[0].body).toBe('server copy');
  });
});

describe('latestUnseenFrom', () => {
  const messages = [msg('a', 'caregiver', 10), msg('b', 'senior', 20), msg('c', 'caregiver', 30)];

  test('finds the most recent message from the given sender after sinceAt', () => {
    expect(latestUnseenFrom(messages, 'caregiver', 0)?.id).toBe('c');
  });

  test('returns null when nothing from that sender is newer than sinceAt', () => {
    expect(latestUnseenFrom(messages, 'caregiver', 30)).toBeNull();
  });

  test('treats a null sinceAt as "never seen" (everything counts)', () => {
    expect(latestUnseenFrom(messages, 'senior', null)?.id).toBe('b');
  });
});

describe('hasUnseenFrom', () => {
  test('true when there is an unseen message from that sender', () => {
    const messages = [msg('a', 'senior', 10)];
    expect(hasUnseenFrom(messages, 'senior', 0)).toBe(true);
  });

  test('false once sinceAt catches up', () => {
    const messages = [msg('a', 'senior', 10)];
    expect(hasUnseenFrom(messages, 'senior', 10)).toBe(false);
  });
});
