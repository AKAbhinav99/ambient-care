import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, space, type, statusMeta, type StatusKey } from '../../theme/tokens';

/** The single at-a-glance signal on the caregiver dashboard. */
export function StatusBadge({ status, reason }: { status: StatusKey; reason: string }) {
  const meta = statusMeta[status];
  return (
    <View style={[styles.wrap, { backgroundColor: meta.soft, borderColor: meta.color }]}>
      <View style={[styles.dot, { backgroundColor: meta.color }]} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.label, { color: meta.color }]}>{meta.label}</Text>
        <Text style={styles.reason}>{reason}</Text>
      </View>
    </View>
  );
}

/** Small inline dot for list rows. */
export function Dot({ status }: { status: StatusKey }) {
  return <View style={[styles.miniDot, { backgroundColor: statusMeta[status].color }]} />;
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    padding: space.lg,
  },
  dot: { width: 18, height: 18, borderRadius: radius.pill },
  miniDot: { width: 10, height: 10, borderRadius: radius.pill },
  label: { fontSize: type.title, fontWeight: '800' },
  reason: { fontSize: type.body, color: colors.inkSoft, marginTop: 2 },
});
