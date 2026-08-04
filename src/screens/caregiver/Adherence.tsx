import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../../lib/store';
import { adherenceStats, todaysDoses, type ResolvedStatus } from '../../lib/adherence';
import { refillStatuses } from '../../lib/refill';
import { exportReport } from '../../lib/report';
import { Card, SectionLabel } from '../../components/ui/Card';
import { Icon } from '../../components/ui/Icon';
import { colors, space, type, radius, font } from '../../theme/tokens';

const STATUS_META: Record<ResolvedStatus, { label: string; color: string }> = {
  taken: { label: 'Taken', color: colors.calm },
  missed: { label: 'Missed', color: colors.urgent },
  due: { label: 'Due now', color: colors.checkIn },
  upcoming: { label: 'Upcoming', color: colors.inkFaint },
  skipped: { label: 'Skipped', color: colors.inkSoft },
};

export function Adherence() {
  const medications = useStore((s) => s.medications);
  const doseLogs = useStore((s) => s.doseLogs);
  const events = useStore((s) => s.events);
  const lovedOne = useStore((s) => s.lovedOne);

  const now = Date.now();
  const stats = useMemo(() => adherenceStats(medications, doseLogs, now, 7), [medications, doseLogs, now]);
  const today = useMemo(() => todaysDoses(medications, doseLogs, now), [medications, doseLogs, now]);
  const refills = useMemo(() => refillStatuses(medications, now), [medications, now]);
  const lowRefill = refills.filter((r) => r.low);

  const [exporting, setExporting] = useState(false);
  const onExport = async () => {
    if (!lovedOne) return;
    setExporting(true);
    try {
      await exportReport(lovedOne, medications, doseLogs, events, now);
    } catch (err) {
      Alert.alert('Could not export', err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Adherence</Text>

        {/* Headline numbers */}
        <View style={styles.stats}>
          <Stat big value={`${stats.adherencePct}%`} label="7-day adherence" tint={colors.calm} />
          <Stat value={String(stats.missedCount)} label="Missed" tint={stats.missedCount > 0 ? colors.urgent : colors.ink} />
          <Stat value={`${stats.currentStreak}`} label="Day streak" tint={colors.accentInk} />
        </View>

        {lowRefill.length > 0 ? (
          <Card style={styles.refillCard}>
            <SectionLabel>Refill soon</SectionLabel>
            {lowRefill.map((r) => (
              <View key={r.med.id} style={styles.refillRow}>
                <Icon name="refresh" size={18} color={colors.checkInInk} strokeWidth={2} />
                <Text style={styles.refillItem}>
                  {r.med.name} — {r.pillsOnHand} left
                  {r.daysLeft != null ? ` (~${r.daysLeft} day${r.daysLeft === 1 ? '' : 's'})` : ''}
                </Text>
              </View>
            ))}
            {lovedOne?.pharmacy ? <Text style={styles.pharmacyNote}>Refill at {lovedOne.pharmacy}</Text> : null}
          </Card>
        ) : null}

        {/* Today's doses */}
        <SectionLabel>Today</SectionLabel>
        <Card raised={false} style={styles.card}>
          {today.length === 0 ? (
            <Text style={styles.empty}>No scheduled doses today.</Text>
          ) : (
            today.map((d, i) => {
              const meta = STATUS_META[d.status];
              return (
                <View key={`${d.med.id}-${d.scheduledAt}`}>
                  {i > 0 ? <View style={styles.divider} /> : null}
                  <View style={styles.doseRow}>
                    <Text style={styles.doseTime}>{d.time}</Text>
                    <Text style={styles.doseName} numberOfLines={1}>
                      {d.med.name}
                    </Text>
                    <View style={[styles.chip, { backgroundColor: meta.color }]}>
                      <Text style={styles.chipText}>{meta.label}</Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </Card>

        {/* Per-med breakdown */}
        <SectionLabel>By medication (7 days)</SectionLabel>
        <Card raised={false} style={styles.card}>
          {stats.byMed.map((m, i) => (
            <View key={m.med.id}>
              {i > 0 ? <View style={styles.divider} /> : null}
              <View style={styles.medRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.medName}>{m.med.name}</Text>
                  <Text style={styles.medMeta}>
                    {m.taken} taken · {m.missed} missed
                  </Text>
                </View>
                <Text
                  style={[
                    styles.medPct,
                    { color: m.adherencePct >= 80 ? colors.calm : m.adherencePct >= 50 ? colors.checkIn : colors.urgent },
                  ]}
                >
                  {m.adherencePct}%
                </Text>
              </View>
            </View>
          ))}
        </Card>

        <Pressable style={[styles.exportBtn, exporting && { opacity: 0.5 }]} onPress={onExport} disabled={exporting || !lovedOne}>
          {!exporting ? <Icon name="file-text" size={20} color={colors.onAccent} strokeWidth={2.2} /> : null}
          <Text style={styles.exportText}>{exporting ? 'Preparing…' : 'Export report for doctor'}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ value, label, big, tint }: { value: string; label: string; big?: boolean; tint: string }) {
  return (
    <View style={[styles.stat, big && styles.statBig]}>
      <Text style={[styles.statValue, { color: tint }]} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  scroll: { padding: space.lg },
  title: { fontFamily: font.display, fontSize: type.headline, color: colors.ink, marginBottom: space.md },

  stats: { flexDirection: 'row', gap: space.sm, marginBottom: space.lg },
  stat: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, padding: space.md },
  statBig: { flex: 1.4 },
  statValue: { fontFamily: font.display, fontSize: type.title },
  statLabel: { fontFamily: font.body, fontSize: type.caption, color: colors.inkFaint, marginTop: 2 },

  refillCard: { marginBottom: space.lg, backgroundColor: colors.checkInSoft, borderColor: colors.checkIn },
  refillRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: 4 },
  refillItem: { flex: 1, fontFamily: font.bodyMed, fontSize: type.body, color: colors.ink },
  pharmacyNote: { fontFamily: font.body, fontSize: type.caption, color: colors.inkSoft, marginTop: space.sm },

  card: { paddingVertical: space.xs, marginBottom: space.lg, backgroundColor: colors.surface },
  divider: { height: 1, backgroundColor: colors.line },
  empty: { fontSize: type.body, color: colors.inkFaint, padding: space.md },

  doseRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.md, paddingHorizontal: space.md },
  doseTime: { fontSize: type.body, fontWeight: '700', color: colors.inkSoft, width: 56 },
  doseName: { flex: 1, fontSize: type.bodyLg, fontWeight: '600', color: colors.ink },
  chip: { borderRadius: radius.pill, paddingHorizontal: space.sm, paddingVertical: 3 },
  chipText: { color: '#fff', fontFamily: font.bodyBold, fontSize: type.caption },

  medRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: space.md, paddingHorizontal: space.md },
  medName: { fontFamily: font.headingMed, fontSize: type.bodyLg, color: colors.ink },
  medMeta: { fontFamily: font.body, fontSize: type.caption, color: colors.inkSoft, marginTop: 2 },
  medPct: { fontFamily: font.display, fontSize: type.title },

  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    padding: space.md,
    marginTop: space.sm,
  },
  exportText: { color: colors.onAccent, fontFamily: font.bodyBold, fontSize: type.bodyLg },
});
