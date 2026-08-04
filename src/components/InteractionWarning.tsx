import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, space, type, font } from '../theme/tokens';
import { Icon, type IconName } from './ui/Icon';
import type { InteractionSeverity, Warning } from '../lib/interactions';

const SEVERITY_STYLE: Record<
  InteractionSeverity,
  { color: string; soft: string; ink: string; label: string }
> = {
  major: { color: colors.urgent, soft: colors.urgentSoft, ink: colors.urgentInk, label: 'Major' },
  moderate: { color: colors.checkIn, soft: colors.checkInSoft, ink: colors.checkInInk, label: 'Moderate' },
  minor: { color: colors.inkFaint, soft: colors.surfaceSunken, ink: colors.inkSoft, label: 'Minor' },
};

const KIND_ICON: Record<Warning['kind'], IconName> = {
  pair: 'alert-triangle',
  duplicate: 'layers',
  food: 'utensils',
};

export function InteractionWarning({ warning }: { warning: Warning }) {
  const s = SEVERITY_STYLE[warning.severity];
  return (
    <View style={[styles.card, { backgroundColor: s.soft, borderColor: s.color }]}>
      <View style={styles.head}>
        <Icon name={KIND_ICON[warning.kind]} size={20} color={s.color} strokeWidth={2.2} />
        <Text style={styles.pair} numberOfLines={2}>
          {warning.a} <Text style={styles.plus}>+</Text> {warning.b}
        </Text>
        <View style={[styles.badge, { backgroundColor: s.color }]}>
          <Text style={styles.badgeText}>{s.label}</Text>
        </View>
      </View>
      <Text style={styles.reason}>{warning.reason}</Text>
      <View style={styles.adviceRow}>
        <Icon name="info" size={14} color={s.ink} strokeWidth={2} />
        <Text style={[styles.advice, { color: s.ink }]}>{warning.advice}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.md,
    borderWidth: 1.5,
    padding: space.md,
    marginBottom: space.sm,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  pair: { flex: 1, fontFamily: font.headingBold, fontSize: type.bodyLg, color: colors.ink },
  plus: { color: colors.inkFaint, fontFamily: font.body },
  badge: { borderRadius: radius.pill, paddingHorizontal: space.sm, paddingVertical: 3 },
  badgeText: { color: '#fff', fontFamily: font.bodyBold, fontSize: type.caption },
  reason: { fontFamily: font.body, fontSize: type.body, color: colors.ink, marginTop: space.sm, lineHeight: type.body * 1.35 },
  adviceRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: space.xs },
  advice: { flex: 1, fontFamily: font.bodyMed, fontSize: type.caption, lineHeight: type.caption * 1.45 },
});
