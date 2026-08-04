import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../lib/store';
import { BigButton } from '../components/ui/BigButton';
import { colors, space, type, radius } from '../theme/tokens';

/**
 * Role-based entry. One codebase, two surfaces — pick which this device is.
 * In production this sits behind Supabase email/phone auth; the role is a column
 * on the user's profile. Here it's an explicit, friendly choice.
 */
export function RoleSelectScreen() {
  const set = useStore((s) => s.setRole);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.brandRow}>
          <Text style={styles.mark}>◕</Text>
          <Text style={styles.brand}>Ambient Care</Text>
        </View>

        <Text style={styles.headline}>Quiet company{'\n'}that speaks up{'\n'}only when it matters.</Text>
        <Text style={styles.sub}>
          A calm helper on a spare phone or tablet, and a small window in your pocket for the family who
          love them.
        </Text>

        <Text style={styles.pick}>Which one is this?</Text>

        <BigButton
          icon="👵"
          label="This is the home device"
          sublabel="Set it on the counter for Mom or Dad"
          variant="accent"
          onPress={() => set('senior')}
          style={{ marginBottom: space.md }}
        />
        <BigButton
          icon="📱"
          label="I'm the caregiver"
          sublabel="Check in on my loved one from my own phone"
          variant="neutral"
          onPress={() => set('caregiver')}
        />

        <Text style={styles.foot}>
          You can switch roles anytime from the menu. Nothing is shared without pairing.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  scroll: { padding: space.lg, paddingTop: space.xl, flexGrow: 1, justifyContent: 'center' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginBottom: space.xl },
  mark: { fontSize: 26, color: colors.accent },
  brand: { fontSize: type.bodyLg, fontWeight: '800', color: colors.accentInk, letterSpacing: 0.3 },
  headline: {
    fontSize: type.headline + 4,
    lineHeight: (type.headline + 4) * 1.12,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.5,
  },
  sub: {
    fontSize: type.bodyLg,
    lineHeight: type.bodyLg * 1.4,
    color: colors.inkSoft,
    marginTop: space.md,
    marginBottom: space.xl,
  },
  pick: {
    fontSize: type.caption,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: colors.inkFaint,
    marginBottom: space.md,
  },
  foot: {
    fontSize: type.caption,
    color: colors.inkFaint,
    textAlign: 'center',
    marginTop: space.xl,
    paddingHorizontal: space.md,
    lineHeight: type.caption * 1.5,
  },
});
