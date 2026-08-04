/**
 * Escalation ladder.
 *
 * When an urgent event fires, we schedule a follow-up local notification a few
 * minutes out that prompts calling a backup emergency contact. If the caregiver
 * acknowledges the event in-app first (`acknowledgeEvent` in the store), we cancel
 * the pending escalation. In production this timer would live server-side and fan
 * out to secondary contacts; the local version demonstrates the same ladder.
 */

import * as Notifications from 'expo-notifications';
import type { CareEvent, LovedOne } from '../types';
import { ensureNotificationPermissions } from './notifications';

export const ESCALATION_DELAY_MIN = 5;

export async function scheduleEscalation(
  event: CareEvent,
  lovedOne: LovedOne,
  delayMin = ESCALATION_DELAY_MIN,
): Promise<void> {
  const ok = await ensureNotificationPermissions();
  if (!ok) return;
  const backup = lovedOne.emergencyContacts?.[0];
  const who = backup ? `${backup.name} (${backup.phone})` : 'a backup contact';
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Still no response about ${lovedOne.name}`,
      body: `"${event.title}" hasn't been acknowledged. Consider calling ${who}.`,
      sound: true,
      data: { kind: 'escalation', eventId: event.id },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: delayMin * 60,
    },
  });
}

export async function cancelEscalation(eventId: string): Promise<void> {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    all
      .filter((n) => {
        const d = n.content.data as { kind?: string; eventId?: string } | undefined;
        return d?.kind === 'escalation' && d?.eventId === eventId;
      })
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
}
