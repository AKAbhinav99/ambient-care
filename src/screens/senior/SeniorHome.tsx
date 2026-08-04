import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useStore } from '../../lib/store';
import { useT, defaultTtsFor } from '../../i18n';
import { useAmbientMonitor } from '../../hooks/useAmbientMonitor';
import { say } from '../../lib/speech';
import { scheduleDoseReminders } from '../../lib/notifications';
import { BigButton } from '../../components/ui/BigButton';
import { DosePrompt } from '../../components/DosePrompt';
import { Icon } from '../../components/ui/Icon';
import { colors, space, type, radius, font } from '../../theme/tokens';
import { clockTime, longDate, partOfDay } from '../../lib/time';
import type { SeniorProps } from '../../navigation/types';

export function SeniorHome({ navigation }: SeniorProps<'SeniorHome'>) {
  const lovedOne = useStore((s) => s.lovedOne);
  const checkIn = useStore((s) => s.checkIn);
  const clearCheckIn = useStore((s) => s.clearCheckIn);
  const logEvent = useStore((s) => s.logEvent);
  const medications = useStore((s) => s.medications);
  const reconcileDoses = useStore((s) => s.reconcileDoses);
  const { t, lang } = useT();

  const [now, setNow] = useState(new Date());
  const ambient = useAmbientMonitor();

  // Tick the clock and, on each tick, reconcile any lapsed doses to "missed".
  useEffect(() => {
    reconcileDoses();
    const t = setInterval(() => {
      setNow(new Date());
      reconcileDoses();
    }, 10000);
    return () => clearInterval(t);
  }, [reconcileDoses]);

  // Keep on-device dose reminders in sync with the current med list, in the
  // loved one's language.
  useEffect(() => {
    if (medications.length) {
      scheduleDoseReminders(medications, { title: t.notif.doseTitle, body: t.notif.doseBody });
    }
  }, [medications, t]);

  // Run ambient monitoring only while this screen is in front (avoids fighting
  // the camera/voice screens for the audio session), and only if consented.
  useFocusEffect(
    useCallback(() => {
      if (lovedOne?.ambientOptIn) ambient.start();
      return () => {
        ambient.stop();
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lovedOne?.ambientOptIn]),
  );

  // Speak the caregiver's hello the moment it arrives.
  useEffect(() => {
    if (checkIn) say(checkIn);
  }, [checkIn]);

  const firstName = lovedOne?.name?.split(' ')[0] ?? 'there';

  const acknowledgeCheckIn = () => {
    say(t.spoken.thankYou);
    logEvent({
      kind: 'activity',
      severity: 'info',
      title: `${firstName} waved back to your hello 👋`,
    });
    clearCheckIn();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Settings affordance — small, out of the way */}
        <Pressable style={styles.gear} onPress={() => navigation.navigate('SeniorSettings')} hitSlop={12}>
          <Icon name="settings" size={26} color={colors.inkFaint} strokeWidth={2} />
        </Pressable>

        {/* Clock + greeting: the calm idle state */}
        <View style={styles.clockBlock}>
          <Text style={styles.greeting}>{t.home.greeting(firstName, partOfDay(now))}</Text>
          <Text style={styles.clock}>{clockTime(now, defaultTtsFor(lang))}</Text>
          <Text style={styles.date}>{longDate(now, defaultTtsFor(lang))}</Text>
        </View>

        {/* Caregiver hello */}
        {checkIn ? (
          <Pressable style={styles.hello} onPress={acknowledgeCheckIn}>
            <Text style={styles.helloText}>{checkIn}</Text>
            <View style={styles.helloBtn}>
              <Icon name="heart" size={20} color={colors.onUrgent} fill={colors.onUrgent} />
              <Text style={styles.helloBtnText}>{t.home.thankYou}</Text>
            </View>
          </Pressable>
        ) : null}

        {/* Time-for-your-pills prompt (only shows when a dose is due) */}
        <DosePrompt now={now.getTime()} />

        {/* Big actions */}
        <View style={styles.actions}>
          <BigButton
            icon="camera"
            label={t.home.scanLabel}
            sublabel={t.home.scanSub}
            variant="accent"
            size="xl"
            onPress={() => navigation.navigate('Scan')}
          />
          <BigButton
            icon="mic"
            label={t.home.talkLabel}
            sublabel={t.home.talkSub}
            variant="neutral"
            size="xl"
            onPress={() => navigation.navigate('Voice')}
            style={{ marginTop: space.md }}
          />
          <BigButton
            icon="shield-plus"
            label={t.home.emergencyLabel}
            sublabel={t.home.emergencySub}
            variant="neutral"
            onPress={() => navigation.navigate('EmergencyCard')}
            style={{ marginTop: space.md }}
          />
        </View>

        {/* Listening strip */}
        {lovedOne?.ambientOptIn ? (
          <ListeningStrip level={ambient.level} simulated={ambient.simulated} name={firstName} />
        ) : (
          <Pressable style={styles.offStrip} onPress={() => navigation.navigate('SeniorSettings')}>
            <Text style={styles.offStripText}>{t.home.listeningOff}</Text>
          </Pressable>
        )}

        {!lovedOne?.paired ? (
          <Pressable style={styles.pairHint} onPress={() => navigation.navigate('Pairing')}>
            <Text style={styles.pairHintText}>{t.home.notConnected}</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function ListeningStrip({ level, simulated, name }: { level: number; simulated: boolean; name: string }) {
  const bars = 5;
  const { t } = useT();
  return (
    <View style={styles.listen}>
      <View style={styles.dotRow}>
        <View style={styles.orangeDot} />
        <Text style={styles.listenText}>{t.home.listening(name)}</Text>
      </View>
      <View style={styles.meter}>
        {Array.from({ length: bars }).map((_, i) => {
          const active = level > (i + 0.5) / bars;
          return <View key={i} style={[styles.meterBar, active && styles.meterBarOn]} />;
        })}
      </View>
      {simulated ? <Text style={styles.simNote}>{t.home.demoLevel}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  scroll: { padding: space.lg, flexGrow: 1 },
  gear: { alignSelf: 'flex-end', padding: space.xs },
  gearIcon: { fontSize: 26, color: colors.inkFaint },

  clockBlock: { alignItems: 'center', marginTop: space.md, marginBottom: space.xl },
  greeting: { fontFamily: font.displaySemi, fontSize: type.seniorGreeting, color: colors.ink, textAlign: 'center' },
  clock: { fontFamily: font.display, fontSize: type.seniorClock, color: colors.accentInk, letterSpacing: -2, marginTop: space.xs },
  date: { fontFamily: font.body, fontSize: type.seniorBody, color: colors.inkSoft, marginTop: space.xs },

  hello: {
    backgroundColor: colors.urgentSoft,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.urgent,
    padding: space.lg,
    marginBottom: space.lg,
    alignItems: 'center',
  },
  helloText: { fontFamily: font.headingMed, fontSize: type.seniorBody, color: colors.ink, textAlign: 'center', lineHeight: type.seniorBody * 1.3 },
  helloBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginTop: space.md,
    backgroundColor: colors.urgent,
    borderRadius: radius.pill,
    paddingVertical: space.sm,
    paddingHorizontal: space.xl,
  },
  helloBtnText: { color: colors.onUrgent, fontFamily: font.bodyBold, fontSize: type.bodyLg },

  actions: { marginBottom: space.lg },

  listen: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: space.md,
    alignItems: 'center',
    gap: space.sm,
  },
  dotRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  orangeDot: { width: 14, height: 14, borderRadius: radius.pill, backgroundColor: '#F5A623' },
  listenText: { fontSize: type.body, color: colors.inkSoft, fontWeight: '500' },
  meter: { flexDirection: 'row', gap: 6, alignItems: 'flex-end', height: 24 },
  meterBar: { width: 12, height: 10, borderRadius: 3, backgroundColor: colors.surfaceSunken },
  meterBarOn: { height: 24, backgroundColor: colors.calm },
  simNote: { fontSize: type.caption, color: colors.inkFaint },

  offStrip: {
    backgroundColor: colors.surfaceSunken,
    borderRadius: radius.md,
    padding: space.md,
    alignItems: 'center',
  },
  offStripText: { fontSize: type.body, color: colors.inkSoft },

  pairHint: {
    marginTop: space.md,
    backgroundColor: colors.checkInSoft,
    borderRadius: radius.md,
    padding: space.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.checkIn,
  },
  pairHintText: { fontSize: type.body, color: colors.ink, fontWeight: '600' },
});
