import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../../lib/store';
import { Card, SectionLabel } from '../../components/ui/Card';
import { BigButton } from '../../components/ui/BigButton';
import { Field } from '../../components/ui/Field';
import { colors, space, type, radius } from '../../theme/tokens';
import type { CaregiverProps } from '../../navigation/types';

export function LovedOneSetup({ navigation }: CaregiverProps<'LovedOne'>) {
  const lovedOne = useStore((s) => s.lovedOne);
  const createLovedOne = useStore((s) => s.createLovedOne);
  const updateLovedOne = useStore((s) => s.updateLovedOne);

  const [name, setName] = useState('');
  const [rel, setRel] = useState('');

  if (!lovedOne) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.title}>Who are we caring for?</Text>
          <Card style={{ marginTop: space.lg }}>
            <Field label="Their name" value={name} onChangeText={setName} placeholder="Rose" autoCapitalize="words" />
            <Field
              label="Your relationship"
              value={rel}
              onChangeText={setRel}
              placeholder="Mother"
              autoCapitalize="words"
            />
          </Card>
          <BigButton
            icon="✓"
            label="Create profile"
            variant="accent"
            disabled={!name.trim() || !rel.trim()}
            onPress={() => {
              createLovedOne(name, rel);
            }}
            style={{ marginTop: space.lg }}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>{lovedOne.name}</Text>
        <Text style={styles.sub}>{lovedOne.relationship}</Text>

        {/* Pairing code */}
        <SectionLabel>Pairing</SectionLabel>
        <Card style={styles.pairCard}>
          {lovedOne.paired ? (
            <View style={styles.pairedRow}>
              <Text style={styles.pairedIcon}>🔗</Text>
              <View>
                <Text style={styles.pairedTitle}>Device paired</Text>
                <Text style={styles.pairedSub}>{lovedOne.name}'s home device is linked.</Text>
              </View>
            </View>
          ) : (
            <>
              <Text style={styles.codeLabel}>Enter this code on the home device</Text>
              <Text style={styles.code}>{lovedOne.pairingCode}</Text>
              <Text style={styles.codeHint}>
                On the home device, choose “This is the home device” → Pairing, and type this code.
              </Text>
              <Pressable
                onPress={() => {
                  // Convenience for the single-device demo: mark paired directly.
                  updateLovedOne({ paired: true });
                  Alert.alert('Paired', 'Marked as paired for this demo.');
                }}
                style={styles.demoPair}
              >
                <Text style={styles.link}>Simulate pairing (demo)</Text>
              </Pressable>
            </>
          )}
        </Card>

        {/* Device mode */}
        <SectionLabel>How the device runs</SectionLabel>
        <Card style={{ marginBottom: space.lg }}>
          <ToggleRow
            title="Always-on mode"
            desc="Keeps the app in front, listening for safety. Best for a dedicated spare device on the counter."
            value={lovedOne.alwaysOnMode}
            onToggle={(v) => updateLovedOne({ alwaysOnMode: v })}
          />
          <View style={styles.divider} />
          <Text style={styles.modeNote}>
            {lovedOne.alwaysOnMode
              ? 'The senior can still leave the app anytime — nothing is locked.'
              : 'Normal mode: the device is used freely. Background listening is limited by iOS — full-strength monitoring happens while the app is open.'}
          </Text>
        </Card>

        {/* Ambient consent */}
        <SectionLabel>Ambient monitoring consent</SectionLabel>
        <Card style={styles.consent}>
          <ToggleRow
            title="Listen for safety"
            desc="The device listens for falls, distress, and unusual silence. Audio is analyzed on-device; nothing is recorded or stored."
            value={lovedOne.ambientOptIn}
            onToggle={(v) => updateLovedOne({ ambientOptIn: v })}
          />
          <Text style={styles.consentNote}>
            iOS shows an orange dot while the mic is active — that's normal and means it's watching
            out for {lovedOne.name}. We explain this on the home device too.
          </Text>
        </Card>

        <BigButton
          icon="←"
          label="Back to dashboard"
          variant="neutral"
          onPress={() => navigation.navigate('CaregiverHome')}
          style={{ marginTop: space.lg }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function ToggleRow({
  title,
  desc,
  value,
  onToggle,
}: {
  title: string;
  desc: string;
  value: boolean;
  onToggle: (v: boolean) => void;
}) {
  return (
    <Pressable onPress={() => onToggle(!value)} style={styles.toggleRow}>
      <View style={{ flex: 1, paddingRight: space.md }}>
        <Text style={styles.toggleTitle}>{title}</Text>
        <Text style={styles.toggleDesc}>{desc}</Text>
      </View>
      <View style={[styles.switch, value && styles.switchOn]}>
        <View style={[styles.knob, value && styles.knobOn]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  scroll: { padding: space.lg },
  title: { fontSize: type.headline, fontWeight: '800', color: colors.ink },
  sub: { fontSize: type.body, color: colors.inkFaint, marginBottom: space.xl },

  pairCard: { marginBottom: space.lg, alignItems: 'center' },
  codeLabel: { fontSize: type.caption, color: colors.inkSoft, fontWeight: '600' },
  code: {
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: 8,
    color: colors.accentInk,
    marginVertical: space.sm,
  },
  codeHint: { fontSize: type.caption, color: colors.inkFaint, textAlign: 'center', lineHeight: type.caption * 1.5 },
  demoPair: { marginTop: space.md },
  link: { color: colors.accentInk, fontWeight: '700', fontSize: type.body },
  pairedRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  pairedIcon: { fontSize: 30 },
  pairedTitle: { fontSize: type.bodyLg, fontWeight: '800', color: colors.calm },
  pairedSub: { fontSize: type.body, color: colors.inkSoft },

  toggleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: space.xs },
  toggleTitle: { fontSize: type.bodyLg, fontWeight: '700', color: colors.ink },
  toggleDesc: { fontSize: type.caption, color: colors.inkSoft, marginTop: 4, lineHeight: type.caption * 1.5 },
  divider: { height: 1, backgroundColor: colors.line, marginVertical: space.sm },
  modeNote: { fontSize: type.caption, color: colors.inkFaint, lineHeight: type.caption * 1.5 },

  consent: { backgroundColor: colors.accentSoft, borderColor: colors.accent },
  consentNote: {
    fontSize: type.caption,
    color: colors.accentInk,
    marginTop: space.md,
    lineHeight: type.caption * 1.5,
  },

  switch: {
    width: 52,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSunken,
    borderWidth: 1,
    borderColor: colors.line,
    justifyContent: 'center',
    padding: 3,
  },
  switchOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  knob: { width: 24, height: 24, borderRadius: radius.pill, backgroundColor: colors.surface },
  knobOn: { alignSelf: 'flex-end' },
});
