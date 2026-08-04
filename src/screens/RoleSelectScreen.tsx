import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../lib/store';
import { useT } from '../i18n';
import { BigButton } from '../components/ui/BigButton';
import { Icon } from '../components/ui/Icon';
import { colors, space, type, radius, font } from '../theme/tokens';

/**
 * Role-based entry. One codebase, two surfaces — pick which this device is.
 * In production this sits behind Supabase email/phone auth; the role is a column
 * on the user's profile. Here it's an explicit, friendly choice.
 */
export function RoleSelectScreen() {
  const set = useStore((s) => s.setRole);
  const { t } = useT();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.brandRow}>
          <View style={styles.logo}>
            <Icon name="activity" size={20} color={colors.onAccent} strokeWidth={2.4} />
          </View>
          <Text style={styles.brand}>{t.role.brand}</Text>
        </View>

        <Text style={styles.headline}>{t.role.headline}</Text>
        <Text style={styles.sub}>{t.role.sub}</Text>

        <Text style={styles.pick}>{t.role.whichIsThis}</Text>

        <BigButton
          icon="shield-plus"
          label={t.role.homeDevice}
          sublabel={t.role.homeDeviceSub}
          variant="accent"
          onPress={() => set('senior')}
          style={{ marginBottom: space.md }}
        />
        <BigButton
          icon="phone"
          label={t.role.caregiver}
          sublabel={t.role.caregiverSub}
          variant="neutral"
          onPress={() => set('caregiver')}
        />

        <Text style={styles.foot}>{t.role.foot}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  scroll: { padding: space.lg, paddingTop: space.xl, flexGrow: 1, justifyContent: 'center' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginBottom: space.xl },
  logo: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: { fontFamily: font.headingBold, fontSize: type.bodyLg, color: colors.accentInk, letterSpacing: 0.2 },
  headline: {
    fontFamily: font.display,
    fontSize: type.headline + 4,
    lineHeight: (type.headline + 4) * 1.14,
    color: colors.ink,
    letterSpacing: -0.5,
  },
  sub: {
    fontFamily: font.body,
    fontSize: type.bodyLg,
    lineHeight: type.bodyLg * 1.4,
    color: colors.inkSoft,
    marginTop: space.md,
    marginBottom: space.xl,
  },
  pick: {
    fontFamily: font.bodyBold,
    fontSize: type.caption,
    letterSpacing: 1.2,
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
