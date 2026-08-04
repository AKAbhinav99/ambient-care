import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../../lib/store';
import { BigButton } from '../../components/ui/BigButton';
import { colors, space, type, radius } from '../../theme/tokens';
import type { SeniorProps } from '../../navigation/types';

export function PairingScreen({ navigation }: SeniorProps<'Pairing'>) {
  const lovedOne = useStore((s) => s.lovedOne);
  const updateLovedOne = useStore((s) => s.updateLovedOne);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Connect to your family</Text>

        {lovedOne ? (
          <>
            <Text style={styles.sub}>
              In your family member's app, they can type this code to connect to this device.
            </Text>
            <View style={styles.codeBox}>
              <Text style={styles.codeLabel}>Your code</Text>
              <Text style={styles.code}>{lovedOne.pairingCode}</Text>
            </View>

            {lovedOne.paired ? (
              <View style={styles.paired}>
                <Text style={styles.pairedText}>✅ You're connected to {lovedOne.relationship}</Text>
              </View>
            ) : (
              <BigButton
                icon="🔗"
                label="Mark as connected"
                sublabel="For this demo device"
                variant="accent"
                size="xl"
                onPress={() => updateLovedOne({ paired: true })}
                style={{ marginTop: space.lg }}
              />
            )}
          </>
        ) : (
          <Text style={styles.sub}>
            Ask your family to open their app and add you first. Then a code will appear here to
            connect.
          </Text>
        )}

        <BigButton label="Done" variant="ghost" onPress={() => navigation.goBack()} style={{ marginTop: space.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  scroll: { padding: space.lg },
  title: { fontSize: type.seniorTitle, fontWeight: '800', color: colors.ink },
  sub: { fontSize: type.seniorBody, color: colors.inkSoft, marginTop: space.md, lineHeight: type.seniorBody * 1.35 },
  codeBox: {
    marginTop: space.xl,
    backgroundColor: colors.accentSoft,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.accent,
    padding: space.xl,
    alignItems: 'center',
  },
  codeLabel: { fontSize: type.body, color: colors.accentInk, fontWeight: '600' },
  code: { fontSize: 60, fontWeight: '900', letterSpacing: 10, color: colors.accentInk, marginTop: space.sm },
  paired: {
    marginTop: space.lg,
    backgroundColor: colors.calmSoft,
    borderRadius: radius.md,
    padding: space.lg,
    alignItems: 'center',
  },
  pairedText: { fontSize: type.seniorBody, fontWeight: '700', color: colors.calm },
});
