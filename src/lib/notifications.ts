/**
 * Notifications.
 *
 * Expo Go reality: remote push (APNs) tokens are not delivered in Expo Go on
 * recent SDKs — that needs a dev/production build. But *local* notifications work
 * fully in Expo Go, which is enough to demonstrate the two caregiver moments that
 * matter: a real-time high-priority alert, and the end-of-day digest. In
 * production these same payloads would arrive via APNs from the backend when a
 * senior-device event fires; the copy and severity logic below stay identical.
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { CareEvent } from '../types';

Notifications.setNotificationHandler({
  handleNotification: async () =>
    ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      // Back-compat with older expo-notifications field name.
      shouldShowAlert: true,
    }) as Notifications.NotificationBehavior,
});

export async function ensureNotificationPermissions(): Promise<boolean> {
  const settings = await Notifications.getPermissionsAsync();
  let granted = settings.granted;
  if (!granted) {
    const req = await Notifications.requestPermissionsAsync();
    granted = req.granted;
  }
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('alerts', {
      name: 'Care alerts',
      importance: Notifications.AndroidImportance.MAX,
    });
  }
  return granted;
}

/** Fire an immediate local alert for a high-priority event. */
export async function fireAlert(event: CareEvent, seniorName: string): Promise<void> {
  const ok = await ensureNotificationPermissions();
  if (!ok) return;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: alertTitle(event, seniorName),
      body: event.detail ?? event.title,
      sound: true,
      data: { eventId: event.id, kind: event.kind },
    },
    trigger: null, // now
  });
}

function alertTitle(event: CareEvent, name: string): string {
  switch (event.kind) {
    case 'voice_distress':
      return `${name} said they don't feel well`;
    case 'loud_sound':
      return `Possible fall at ${name}'s`;
    case 'silence_anomaly':
      return `${name} has been quiet a while`;
    case 'scan_mismatch':
      return `${name} scanned an unknown medicine`;
    default:
      return `Update from ${name}`;
  }
}

/** Schedule (or reschedule) the calm end-of-day summary. */
export async function scheduleDailyDigest(hour = 20, minute = 0): Promise<void> {
  const ok = await ensureNotificationPermissions();
  if (!ok) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Daily summary ready',
      body: "Here's how today looked. Tap to see the details.",
      data: { kind: 'digest' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

/** Build the digest sentence from the day's events (the low-noise summary). */
export function buildDigest(events: CareEvent[], name: string): string {
  const now = Date.now();
  const today = events.filter((e) => now - e.at < 24 * 3600 * 1000);
  const urgent = today.filter((e) => e.severity === 'urgent').length;
  const checkIns = today.filter((e) => e.severity === 'checkIn').length;

  if (urgent > 0) {
    return `${name}'s day had ${urgent} alert${urgent > 1 ? 's' : ''} that needed attention. Details inside.`;
  }
  if (checkIns > 0) {
    return `${name}'s day looked mostly normal — ${checkIns} check-in prompt${checkIns > 1 ? 's' : ''} today.`;
  }
  return `${name}'s day looked normal. No alerts.`;
}
