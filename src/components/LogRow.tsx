import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { CareEvent, EventKind, EventSeverity } from '../types';
import { colors, radius, space, type, font, statusMeta } from '../theme/tokens';
import { Icon, type IconName } from './ui/Icon';
import { relativeTime } from '../lib/time';

const KIND_ICON: Record<EventKind, IconName> = {
  scan_match: 'pill',
  scan_mismatch: 'alert-triangle',
  voice_distress: 'alert-circle',
  voice_call: 'phone',
  voice_meds: 'message',
  loud_sound: 'volume',
  silence_anomaly: 'volume-off',
  activity: 'dot',
  missed_dose: 'clock',
  refill_low: 'refresh',
  pairing: 'link',
};

const SEV_TO_STATUS: Record<EventSeverity, 'calm' | 'checkIn' | 'urgent'> = {
  info: 'calm',
  checkIn: 'checkIn',
  urgent: 'urgent',
};

export function LogRow({ event }: { event: CareEvent }) {
  const status = SEV_TO_STATUS[event.severity];
  const meta = statusMeta[status];
  return (
    <View style={styles.row}>
      <View style={[styles.iconWell, { backgroundColor: meta.soft }]}>
        <Icon name={KIND_ICON[event.kind]} size={18} color={meta.ink} strokeWidth={2} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>{event.title}</Text>
        {event.detail ? <Text style={styles.detail}>{event.detail}</Text> : null}
      </View>
      <View style={styles.meta}>
        {event.severity !== 'info' ? <View style={[styles.tag, { backgroundColor: meta.color }]} /> : null}
        <Text style={styles.time}>{relativeTime(event.at)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: space.md, paddingVertical: space.md },
  iconWell: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, paddingTop: 2 },
  title: { fontFamily: font.bodyMed, fontSize: type.body, color: colors.ink, lineHeight: type.body * 1.25 },
  detail: { fontFamily: font.body, fontSize: type.caption, color: colors.inkSoft, marginTop: 2, lineHeight: type.caption * 1.4 },
  meta: { alignItems: 'flex-end', gap: 4 },
  tag: { width: 8, height: 8, borderRadius: radius.pill },
  time: { fontFamily: font.body, fontSize: type.caption, color: colors.inkFaint },
});
