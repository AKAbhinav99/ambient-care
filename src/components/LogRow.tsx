import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { CareEvent, EventKind, EventSeverity } from '../types';
import { colors, radius, space, type, statusMeta } from '../theme/tokens';
import { relativeTime } from '../lib/time';

const KIND_ICON: Record<EventKind, string> = {
  scan_match: '💊',
  scan_mismatch: '⚠️',
  voice_distress: '🆘',
  voice_call: '📞',
  voice_meds: '💬',
  loud_sound: '🔊',
  silence_anomaly: '🔇',
  activity: '·',
  pairing: '🔗',
};

const SEV_TO_STATUS: Record<EventSeverity, 'calm' | 'checkIn' | 'urgent'> = {
  info: 'calm',
  checkIn: 'checkIn',
  urgent: 'urgent',
};

export function LogRow({ event }: { event: CareEvent }) {
  const status = SEV_TO_STATUS[event.severity];
  const accent = statusMeta[status].color;
  return (
    <View style={styles.row}>
      <View style={[styles.iconWell, { backgroundColor: statusMeta[status].soft }]}>
        <Text style={styles.icon}>{KIND_ICON[event.kind]}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>{event.title}</Text>
        {event.detail ? <Text style={styles.detail}>{event.detail}</Text> : null}
      </View>
      <View style={styles.meta}>
        {event.severity !== 'info' ? <View style={[styles.tag, { backgroundColor: accent }]} /> : null}
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
  icon: { fontSize: 20 },
  body: { flex: 1, paddingTop: 2 },
  title: { fontSize: type.body, fontWeight: '600', color: colors.ink, lineHeight: type.body * 1.25 },
  detail: { fontSize: type.caption, color: colors.inkSoft, marginTop: 2, lineHeight: type.caption * 1.4 },
  meta: { alignItems: 'flex-end', gap: 4 },
  tag: { width: 8, height: 8, borderRadius: radius.pill },
  time: { fontSize: type.caption, color: colors.inkFaint },
});
