import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useStore, computeStatus } from '../../lib/store';
import { buildDigest, scheduleDailyDigest } from '../../lib/notifications';
import { checkInteractions } from '../../lib/interactions';
import { adherenceStats } from '../../lib/adherence';
import { hasUnseenFrom } from '../../lib/chat';
import { isSupabaseConfigured } from '../../lib/supabase';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Card, SectionLabel } from '../../components/ui/Card';
import { BigButton } from '../../components/ui/BigButton';
import { LogRow } from '../../components/LogRow';
import { Icon } from '../../components/ui/Icon';
import { colors, space, type, radius, font } from '../../theme/tokens';
import { relativeTime, greeting } from '../../lib/time';
import type { CaregiverProps } from '../../navigation/types';

export function CaregiverDashboard({ navigation }: CaregiverProps<'CaregiverHome'>) {
  const state = useStore();
  const { lovedOne, medications, events, messages, lastSeenByCaregiverAt } = state;
  const status = useMemo(() => computeStatus(state), [state]);
  const reconcileDoses = useStore((s) => s.reconcileDoses);
  const syncMessages = useStore((s) => s.syncMessages);
  const acknowledgeEvent = useStore((s) => s.acknowledgeEvent);
  const [digestOn, setDigestOn] = useState(false);

  // Catch any lapsed doses, and poll for new messages, whenever the caregiver
  // opens the dashboard.
  useFocusEffect(
    useCallback(() => {
      reconcileDoses();
      syncMessages();
    }, [reconcileDoses, syncMessages]),
  );

  const unreadMessages = hasUnseenFrom(messages, 'senior', lastSeenByCaregiverAt);

  const warnings = useMemo(() => checkInteractions(medications), [medications]);
  const adherence = useMemo(
    () => adherenceStats(medications, state.doseLogs, Date.now(), 7),
    [medications, state.doseLogs],
  );
  const unackedUrgent = events.find(
    (e) => e.severity === 'urgent' && !e.acknowledgedAt && Date.now() - e.at < 24 * 3600 * 1000,
  );

  const alertsToday = events.filter(
    (e) => Date.now() - e.at < 24 * 3600 * 1000 && e.severity !== 'info',
  ).length;

  if (!lovedOne) return <EmptyState navigation={navigation} />;

  const digest = buildDigest(events, lovedOne.name);

  const toggleDigest = async () => {
    if (!digestOn) {
      await scheduleDailyDigest(20, 0);
      setDigestOn(true);
      Alert.alert('Daily summary on', "You'll get a calm recap at 8:00 PM each day.");
    } else {
      setDigestOn(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.greeting}>{greeting(new Date())}</Text>
        <Text style={styles.headline}>
          {lovedOne.name}
          <Text style={styles.rel}>  ·  {lovedOne.relationship}</Text>
        </Text>

        {!lovedOne.paired ? (
          <Pressable onPress={() => navigation.navigate('LovedOne')} style={styles.pairingWarn}>
            <Icon name="alert-triangle" size={18} color={colors.checkInInk} strokeWidth={2.2} />
            <Text style={styles.pairingWarnText}>Device not paired yet — tap to finish setup</Text>
          </Pressable>
        ) : null}

        <View style={{ height: space.lg }} />
        <StatusBadge status={status.key} reason={status.reason} />

        {unackedUrgent ? (
          <Pressable style={styles.ackBtn} onPress={() => acknowledgeEvent(unackedUrgent.id)}>
            <Icon name="check" size={18} color={colors.onUrgent} strokeWidth={2.6} />
            <Text style={styles.ackText}>Acknowledge — {unackedUrgent.title}</Text>
          </Pressable>
        ) : null}

        {warnings.length > 0 ? (
          <Pressable style={styles.warnBanner} onPress={() => navigation.navigate('Interactions')}>
            <Icon name="alert-triangle" size={20} color={colors.checkInInk} strokeWidth={2.2} />
            <Text style={styles.warnBannerText}>
              {warnings.length} medication interaction{warnings.length > 1 ? 's' : ''} to review
            </Text>
            <Icon name="chevron-right" size={20} color={colors.inkFaint} />
          </Pressable>
        ) : null}

        {/* Stat rhythm — three uneven weights, not a uniform grid */}
        <View style={styles.stats}>
          <Stat big value={relativeTime(state.lastActivityAt)} label="Last activity" />
          <Stat value={String(medications.length)} label="Medications" />
          <Stat value={String(alertsToday)} label="Alerts today" tint={alertsToday > 0} />
        </View>

        <Card style={styles.digest}>
          <SectionLabel>Today so far</SectionLabel>
          <Text style={styles.digestText}>{digest}</Text>
          <Pressable onPress={toggleDigest} style={styles.digestToggle}>
            <View style={[styles.switch, digestOn && styles.switchOn]}>
              <View style={[styles.knob, digestOn && styles.knobOn]} />
            </View>
            <Text style={styles.digestToggleLabel}>Send me an 8:00 PM summary</Text>
          </Pressable>
        </Card>

        <Pressable style={styles.adherenceCard} onPress={() => navigation.navigate('Adherence')}>
          <Text style={styles.adhBig}>{adherence.adherencePct}%</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.adhLine}>
              {adherence.takenCount} taken · {adherence.missedCount} missed this week
            </Text>
            <Text style={styles.adhSub}>
              {adherence.currentStreak}-day streak · tap for details
            </Text>
          </View>
          <Icon name="chevron-right" size={20} color={colors.inkFaint} />
        </Pressable>

        <View style={styles.actions}>
          <View style={{ flex: 1 }}>
            <BigButton
              icon="message"
              label={`Message ${lovedOne.name}`}
              variant="accent"
              onPress={() => navigation.navigate('Chat')}
            />
            {unreadMessages ? <View style={styles.unreadDot} /> : null}
          </View>
        </View>
        <View style={styles.actionRow}>
          <BigButton
            icon="pill"
            label="Medications"
            variant="neutral"
            onPress={() => navigation.navigate('Medications')}
            style={{ flex: 1 }}
          />
          <BigButton
            icon="user"
            label="Loved one"
            variant="neutral"
            onPress={() => navigation.navigate('LovedOne')}
            style={{ flex: 1 }}
          />
        </View>
        <View style={styles.actionRow}>
          <BigButton
            icon="trending-up"
            label="Adherence"
            variant="neutral"
            onPress={() => navigation.navigate('Adherence')}
            style={{ flex: 1 }}
          />
          <BigButton
            icon="shield-plus"
            label="Emergency card"
            variant="neutral"
            onPress={() => navigation.navigate('EmergencyCard')}
            style={{ flex: 1 }}
          />
        </View>

        <View style={styles.logHead}>
          <SectionLabel>Recent activity</SectionLabel>
          {events.length > 6 ? (
            <Pressable onPress={() => navigation.navigate('DailyLog')}>
              <Text style={styles.link}>See all</Text>
            </Pressable>
          ) : null}
        </View>
        <Card raised={false} style={styles.logCard}>
          {events.length === 0 ? (
            <Text style={styles.empty}>
              Nothing yet. Events from {lovedOne.name}'s device — scans, voice, sounds — show up here.
            </Text>
          ) : (
            events.slice(0, 6).map((e, i) => (
              <View key={e.id}>
                {i > 0 ? <View style={styles.divider} /> : null}
                <LogRow event={e} />
              </View>
            ))
          )}
        </Card>

        <Text style={styles.backend}>
          {isSupabaseConfigured
            ? '● Connected to Supabase — events sync live'
            : '○ Running local-only. Add Supabase keys to sync across devices.'}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({
  value,
  label,
  big,
  tint,
}: {
  value: string;
  label: string;
  big?: boolean;
  tint?: boolean;
}) {
  return (
    <View style={[styles.stat, big && styles.statBig]}>
      <Text style={[styles.statValue, tint && { color: colors.checkIn }]} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function EmptyState({ navigation }: { navigation: CaregiverProps<'CaregiverHome'>['navigation'] }) {
  const seedDemo = useStore((s) => s.seedDemo);
  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={[styles.scroll, { justifyContent: 'center', flexGrow: 1 }]}>
        <Text style={styles.emptyTitle}>Let's set things up</Text>
        <Text style={styles.emptySub}>
          Add the person you're caring for, then log their medications so the home device can
          recognize them.
        </Text>
        <BigButton
          icon="plus"
          label="Add a loved one"
          variant="accent"
          onPress={() => navigation.navigate('LovedOne')}
          style={{ marginTop: space.xl }}
        />
        <Pressable onPress={seedDemo} style={{ marginTop: space.lg, alignItems: 'center' }}>
          <Text style={styles.link}>or load demo data (Rose + 3 medications)</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  scroll: { padding: space.lg },
  greeting: { fontFamily: font.body, fontSize: type.body, color: colors.inkSoft },
  headline: { fontFamily: font.display, fontSize: type.headline, color: colors.ink, letterSpacing: -0.4 },
  rel: { fontSize: type.body, fontWeight: '500', color: colors.inkFaint },
  pairingWarn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginTop: space.md,
    backgroundColor: colors.checkInSoft,
    borderRadius: radius.sm,
    padding: space.md,
    borderWidth: 1,
    borderColor: colors.checkIn,
  },
  pairingWarnText: { flex: 1, color: colors.checkInInk, fontFamily: font.bodyMed, fontSize: type.body },

  ackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginTop: space.sm,
    backgroundColor: colors.urgent,
    borderRadius: radius.md,
    padding: space.md,
  },
  ackText: { flex: 1, color: colors.onUrgent, fontFamily: font.bodyBold, fontSize: type.body },

  warnBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginTop: space.sm,
    backgroundColor: colors.checkInSoft,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.checkIn,
    padding: space.md,
  },
  warnBannerText: { flex: 1, color: colors.checkInInk, fontFamily: font.bodyMed, fontSize: type.body },

  adherenceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    marginTop: space.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: space.lg,
  },
  adhBig: { fontFamily: font.display, fontSize: type.headline, color: colors.calmInk },
  adhLine: { fontFamily: font.bodyMed, fontSize: type.body, color: colors.ink },
  adhSub: { fontFamily: font.body, fontSize: type.caption, color: colors.inkFaint, marginTop: 2 },

  stats: { flexDirection: 'row', gap: space.sm, marginTop: space.md },
  stat: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: space.md,
  },
  statBig: { flex: 1.6 },
  statValue: { fontFamily: font.headingBold, fontSize: type.bodyLg, color: colors.ink },
  statLabel: { fontFamily: font.body, fontSize: type.caption, color: colors.inkFaint, marginTop: 2 },

  digest: { marginTop: space.md },
  digestText: { fontSize: type.bodyLg, color: colors.ink, lineHeight: type.bodyLg * 1.35, fontWeight: '500' },
  digestToggle: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: space.md },
  digestToggleLabel: { fontSize: type.body, color: colors.inkSoft },
  switch: {
    width: 46,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSunken,
    borderWidth: 1,
    borderColor: colors.line,
    justifyContent: 'center',
    padding: 2,
  },
  switchOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  knob: {
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
  knobOn: { alignSelf: 'flex-end' },

  actions: { flexDirection: 'row', marginTop: space.lg },
  unreadDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 14,
    height: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.urgent,
    borderWidth: 2,
    borderColor: colors.paper,
  },
  actionRow: { flexDirection: 'row', gap: space.sm, marginTop: space.sm },

  logHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: space.xl,
    marginBottom: space.xs,
  },
  logCard: { paddingVertical: space.xs, backgroundColor: colors.surface },
  divider: { height: 1, backgroundColor: colors.line },
  empty: { fontSize: type.body, color: colors.inkFaint, padding: space.md, lineHeight: type.body * 1.4 },
  link: { color: colors.accentInk, fontWeight: '700', fontSize: type.body },

  backend: {
    fontSize: type.caption,
    color: colors.inkFaint,
    textAlign: 'center',
    marginTop: space.xl,
  },

  emptyTitle: { fontSize: type.headline, fontWeight: '800', color: colors.ink },
  emptySub: {
    fontSize: type.bodyLg,
    color: colors.inkSoft,
    lineHeight: type.bodyLg * 1.4,
    marginTop: space.md,
  },
});
