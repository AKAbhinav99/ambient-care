import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../../lib/store';
import { Card } from '../../components/ui/Card';
import { BigButton } from '../../components/ui/BigButton';
import { colors, space, type, radius } from '../../theme/tokens';
import type { SeniorProps } from '../../navigation/types';

export function SeniorSettings({ navigation }: SeniorProps<'SeniorSettings'>) {
  const lovedOne = useStore((s) => s.lovedOne);
  const updateLovedOne = useStore((s) => s.updateLovedOne);
  const signOut = useStore((s) => s.signOut);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Settings</Text>

        {lovedOne ? (
          <>
            <ToggleCard
              icon="🖥️"
              title="Always-on mode"
              desc="Keep this app in front so it can watch out for you. You can always leave it to use other apps — nothing is locked."
              value={lovedOne.alwaysOnMode}
              onToggle={(v) => updateLovedOne({ alwaysOnMode: v })}
            />

            <ToggleCard
              icon="👂"
              title="Listen for my safety"
              desc="This device listens for falls, distress, and unusual quiet. Sounds are checked right here on the device — nothing is recorded or sent anywhere."
              value={lovedOne.ambientOptIn}
              onToggle={(v) => updateLovedOne({ ambientOptIn: v })}
              highlight
            />

            {/* The orange-dot explainer */}
            <Card raised={false} style={styles.dotCard}>
              <View style={styles.dotRow}>
                <View style={styles.orangeDot} />
                <Text style={styles.dotTitle}>About the orange dot</Text>
              </View>
              <Text style={styles.dotText}>
                When you see a small orange dot at the top of the screen, it just means the device is
                listening for your safety. That's a good thing — it's watching out for you.
              </Text>
            </Card>
          </>
        ) : (
          <Text style={styles.note}>Ask your family to finish setting up your profile.</Text>
        )}

        <BigButton
          icon="🔗"
          label="Connect to family"
          variant="neutral"
          onPress={() => navigation.navigate('Pairing')}
          style={{ marginTop: space.lg }}
        />

        <Pressable
          onPress={() =>
            Alert.alert('Switch device role?', 'This returns to the first screen.', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Switch', onPress: signOut },
            ])
          }
          style={styles.switchRole}
        >
          <Text style={styles.switchText}>Switch role / start over</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function ToggleCard({
  icon,
  title,
  desc,
  value,
  onToggle,
  highlight,
}: {
  icon: string;
  title: string;
  desc: string;
  value: boolean;
  onToggle: (v: boolean) => void;
  highlight?: boolean;
}) {
  return (
    <Pressable onPress={() => onToggle(!value)}>
      <Card style={[styles.toggleCard, highlight && { backgroundColor: colors.accentSoft, borderColor: colors.accent }]}>
        <View style={styles.toggleHead}>
          <Text style={styles.toggleIcon}>{icon}</Text>
          <Text style={styles.toggleTitle}>{title}</Text>
          <View style={[styles.switch, value && styles.switchOn]}>
            <View style={[styles.knob, value && styles.knobOn]} />
          </View>
        </View>
        <Text style={styles.toggleDesc}>{desc}</Text>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  scroll: { padding: space.lg },
  title: { fontSize: type.seniorTitle, fontWeight: '800', color: colors.ink, marginBottom: space.lg },
  note: { fontSize: type.body, color: colors.inkSoft },

  toggleCard: { marginBottom: space.md },
  toggleHead: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  toggleIcon: { fontSize: 30 },
  toggleTitle: { flex: 1, fontSize: type.bodyLg, fontWeight: '800', color: colors.ink },
  toggleDesc: { fontSize: type.body, color: colors.inkSoft, marginTop: space.sm, lineHeight: type.body * 1.4 },

  dotCard: { backgroundColor: colors.surfaceSunken, marginBottom: space.md },
  dotRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  orangeDot: { width: 16, height: 16, borderRadius: radius.pill, backgroundColor: '#F5A623' },
  dotTitle: { fontSize: type.bodyLg, fontWeight: '700', color: colors.ink },
  dotText: { fontSize: type.body, color: colors.inkSoft, marginTop: space.sm, lineHeight: type.body * 1.45 },

  switch: {
    width: 56,
    height: 34,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSunken,
    borderWidth: 1,
    borderColor: colors.line,
    justifyContent: 'center',
    padding: 3,
  },
  switchOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  knob: { width: 26, height: 26, borderRadius: radius.pill, backgroundColor: colors.surface },
  knobOn: { alignSelf: 'flex-end' },

  switchRole: { marginTop: space.xl, alignItems: 'center', padding: space.md },
  switchText: { color: colors.inkFaint, fontSize: type.body, fontWeight: '600' },
});
