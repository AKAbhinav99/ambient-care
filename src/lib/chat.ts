/**
 * Pure message-list helpers — no store/network dependency, so they're directly
 * unit-testable. `mergeMessages` combines the local thread with a batch fetched
 * from the backend: dedupe by id (a message already sent locally shows up again
 * once the poll catches it), sorted oldest-first for a normal chat list.
 */

import type { ChatMessage } from '../types';

export function mergeMessages(local: ChatMessage[], incoming: ChatMessage[]): ChatMessage[] {
  if (!incoming.length) return local;
  const byId = new Map<string, ChatMessage>();
  for (const m of local) byId.set(m.id, m);
  for (const m of incoming) byId.set(m.id, m);
  return Array.from(byId.values()).sort((a, b) => a.at - b.at);
}

/** The most recent message from `sender` that arrived after `sinceAt`, if any. */
export function latestUnseenFrom(
  messages: ChatMessage[],
  sender: ChatMessage['sender'],
  sinceAt: number | null,
): ChatMessage | null {
  const cutoff = sinceAt ?? 0;
  let latest: ChatMessage | null = null;
  for (const m of messages) {
    if (m.sender !== sender || m.at <= cutoff) continue;
    if (!latest || m.at > latest.at) latest = m;
  }
  return latest;
}

/** Whether `sender` has any message after `sinceAt` — powers the unread dot. */
export function hasUnseenFrom(messages: ChatMessage[], sender: ChatMessage['sender'], sinceAt: number | null): boolean {
  return latestUnseenFrom(messages, sender, sinceAt) !== null;
}
