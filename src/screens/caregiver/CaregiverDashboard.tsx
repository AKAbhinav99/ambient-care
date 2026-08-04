import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore, computeStatus } from '../../lib/store';
import { buildDigest, scheduleDailyDigest } from '../../lib/notifications';
import { isSupabaseConfigured } from '../../lib/supabase';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Card, SectionLabel } from '../../components/ui/Card';
import { BigButton } from '../../components/ui/BigButton';
import { LogRow } from '../../components/LogRow';
import { colors, space, type, radius } from '../../theme/tokens';
import { relativeTime, greeting } from '../../lib/time';
import type { CaregiverProps } from '../../navigation/types';

export function CaregiverDashboard({ navigation }: CaregiverProps<'CaregiverHome'>) {
  const state = useStore();
  const { lovedOne, medications, events } = state;
  const status = useMemo(() => computeStatus(state), [state]);
  const [digestOn, setDigestOn] = useState(false);

  const alertsToday = events.filter(
    (e) => Date.now() - e.at < 24 * 3600 * 1000 && e.severity !== 'info',
  ).length;

  if (!lovedOne) return <EmptyState navigation={navigation} />;

  const digest = buildDigest(events, lovedOne.name);

  const defaultHello = `${lovedOne.relationship} is thinking of you ❤️`;
  const sendHello = (msg: string) => {
    state.sendCheckIn(msg.trim() || defaultHello);
    Alert.alert('Sent', `Your hello is on its way to ${lovedOne.name}.`);
  };

  const onCheckIn = () => {
    // Alert.prompt is iOS-only; fall back to a preset hello elsewhere.
    if (typeof Alert.prompt === 'function') {
      Alert.prompt(
        `Send ${lovedOne.name} a hello`,
        "It'll light up their screen and read out loud.",
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Send', onPress: (msg?: string) => sendHello(msg ?? '') },
        ],
        'plain-text',
        '',
      );
    } else {
      sendHello(defaultHello);
    }
  };

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
            <Text style={styles.pairingWarnText}>
              ⚠️ Device not paired yet — tap to finish setup
            </Text>
          </Pressable>
        ) : null}

        <View style={{ height: space.lg }} />
        <StatusBadge status={status.key} reason={status.reason} />

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

        <View style={styles.actions}>
          <BigButton
            icon="❤️"
            label="Send a hello"
            variant="accent"
            onPress={onCheckIn}
            style={{ flex: 1 }}
          />
        </View>
        <View style={styles.actionRow}>
          <BigButton
            icon="💊"
            label="Medications"
            variant="neutral"
            onPress={() => navigation.navigate('Medications')}
            style={{ flex: 1 }}
          />
          <BigButton
            icon="⚙️"
            label="Loved one"
            variant="neutral"
            onPress={() => navigation.navigate('LovedOne')}
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
          icon="➕"
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
  greeting: { fontSize: type.body, color: colors.inkSoft, fontWeight: '500' },
  headline: { fontSize: type.headline, fontWeight: '800', color: colors.ink, letterSpacing: -0.4 },
  rel: { fontSize: type.body, fontWeight: '500', color: colors.inkFaint },
  pairingWarn: {
    marginTop: space.md,
    backgroundColor: colors.checkInSoft,
    borderRadius: radius.sm,
    padding: space.md,
    borderWidth: 1,
    borderColor: colors.checkIn,
  },
  pairingWarnText: { color: colors.ink, fontWeight: '600', fontSize: type.body },

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
  statValue: { fontSize: type.bodyLg, fontWeight: '800', color: colors.ink },
  statLabel: { fontSize: type.caption, color: colors.inkFaint, marginTop: 2 },

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
