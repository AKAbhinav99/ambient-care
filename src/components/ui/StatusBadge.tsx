import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, space, type, font, statusMeta, type StatusKey } from '../../theme/tokens';
import { Icon, type IconName } from './Icon';

const STATUS_ICON: Record<StatusKey, IconName> = {
  calm: 'check-circle',
  checkIn: 'alert-triangle',
  urgent: 'alert-circle',
};

/** The single at-a-glance signal on the caregiver dashboard. */
export function StatusBadge({ status, reason }: { status: StatusKey; reason: string }) {
  const meta = statusMeta[status];
  return (
    <View style={[styles.wrap, { backgroundColor: meta.soft, borderColor: meta.color }]}>
      <View style={[styles.iconCircle, { backgroundColor: meta.color }]}>
        <Icon name={STATUS_ICON[status]} size={22} color="#fff" strokeWidth={2.2} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.label, { color: meta.ink }]}>{meta.label}</Text>
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
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniDot: { width: 10, height: 10, borderRadius: radius.pill },
  label: { fontFamily: font.headingBold, fontSize: type.title },
  reason: { fontFamily: font.body, fontSize: type.body, color: colors.inkSoft, marginTop: 2 },
});
