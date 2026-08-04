import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useStore } from '../../lib/store';
import { useAmbientMonitor } from '../../hooks/useAmbientMonitor';
import { say } from '../../lib/speech';
import { BigButton } from '../../components/ui/BigButton';
import { colors, space, type, radius } from '../../theme/tokens';
import { clockTime, longDate, greeting } from '../../lib/time';
import type { SeniorProps } from '../../navigation/types';

export function SeniorHome({ navigation }: SeniorProps<'SeniorHome'>) {
  const lovedOne = useStore((s) => s.lovedOne);
  const checkIn = useStore((s) => s.checkIn);
  const clearCheckIn = useStore((s) => s.clearCheckIn);
  const logEvent = useStore((s) => s.logEvent);

  const [now, setNow] = useState(new Date());
  const ambient = useAmbientMonitor();

  // Tick the clock.
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(t);
  }, []);

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
    say('Thank you. I love you too.');
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
          <Text style={styles.gearIcon}>⚙︎</Text>
        </Pressable>

        {/* Clock + greeting: the calm idle state */}
        <View style={styles.clockBlock}>
          <Text style={styles.greeting}>
            {greeting(now)}, {firstName}
          </Text>
          <Text style={styles.clock}>{clockTime(now)}</Text>
          <Text style={styles.date}>{longDate(now)}</Text>
        </View>

        {/* Caregiver hello */}
        {checkIn ? (
          <Pressable style={styles.hello} onPress={acknowledgeCheckIn}>
            <Text style={styles.helloText}>{checkIn}</Text>
            <View style={styles.helloBtn}>
              <Text style={styles.helloBtnText}>Thank you 👋</Text>
            </View>
          </Pressable>
        ) : null}

        {/* Big actions */}
        <View style={styles.actions}>
          <BigButton
            icon="📷"
            label="Scan my medicine"
            sublabel="Point the camera at the bottle"
            variant="accent"
            size="xl"
            onPress={() => navigation.navigate('Scan')}
          />
          <BigButton
            icon="🎙️"
            label="Talk to me"
            sublabel="Ask for your pills, or to call family"
            variant="neutral"
            size="xl"
            onPress={() => navigation.navigate('Voice')}
            style={{ marginTop: space.md }}
          />
        </View>

        {/* Listening strip */}
        {lovedOne?.ambientOptIn ? (
          <ListeningStrip level={ambient.level} simulated={ambient.simulated} name={firstName} />
        ) : (
          <Pressable style={styles.offStrip} onPress={() => navigation.navigate('SeniorSettings')}>
            <Text style={styles.offStripText}>Safety listening is off — tap to turn it on</Text>
          </Pressable>
        )}

        {!lovedOne?.paired ? (
          <Pressable style={styles.pairHint} onPress={() => navigation.navigate('Pairing')}>
            <Text style={styles.pairHintText}>Not connected to family yet — tap to connect</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function ListeningStrip({ level, simulated, name }: { level: number; simulated: boolean; name: string }) {
  const bars = 5;
  return (
    <View style={styles.listen}>
      <View style={styles.dotRow}>
        <View style={styles.orangeDot} />
        <Text style={styles.listenText}>I'm listening, keeping {name} safe</Text>
      </View>
      <View style={styles.meter}>
        {Array.from({ length: bars }).map((_, i) => {
          const active = level > (i + 0.5) / bars;
          return <View key={i} style={[styles.meterBar, active && styles.meterBarOn]} />;
        })}
      </View>
      {simulated ? <Text style={styles.simNote}>demo level</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  scroll: { padding: space.lg, flexGrow: 1 },
  gear: { alignSelf: 'flex-end', padding: space.xs },
  gearIcon: { fontSize: 26, color: colors.inkFaint },

  clockBlock: { alignItems: 'center', marginTop: space.md, marginBottom: space.xl },
  greeting: { fontSize: type.seniorGreeting, fontWeight: '700', color: colors.ink, textAlign: 'center' },
  clock: { fontSize: type.seniorClock, fontWeight: '900', color: colors.accentInk, letterSpacing: -2, marginTop: space.xs },
  date: { fontSize: type.seniorBody, color: colors.inkSoft, marginTop: space.xs },

  hello: {
    backgroundColor: colors.urgentSoft,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.urgent,
    padding: space.lg,
    marginBottom: space.lg,
    alignItems: 'center',
  },
  helloText: { fontSize: type.seniorBody, fontWeight: '700', color: colors.ink, textAlign: 'center', lineHeight: type.seniorBody * 1.3 },
  helloBtn: {
    marginTop: space.md,
    backgroundColor: colors.urgent,
    borderRadius: radius.pill,
    paddingVertical: space.sm,
    paddingHorizontal: space.xl,
  },
  helloBtnText: { color: colors.onUrgent, fontSize: type.bodyLg, fontWeight: '800' },

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
