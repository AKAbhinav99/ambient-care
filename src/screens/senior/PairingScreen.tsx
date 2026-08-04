import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../../lib/store';
import { useT } from '../../i18n';
import { BigButton } from '../../components/ui/BigButton';
import { Icon } from '../../components/ui/Icon';
import { colors, space, type, radius, font } from '../../theme/tokens';
import type { SeniorProps } from '../../navigation/types';

export function PairingScreen({ navigation }: SeniorProps<'Pairing'>) {
  const lovedOne = useStore((s) => s.lovedOne);
  const updateLovedOne = useStore((s) => s.updateLovedOne);
  const { t } = useT();

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>{t.pairing.title}</Text>

        {lovedOne ? (
          <>
            <Text style={styles.sub}>{t.pairing.sub}</Text>
            <View style={styles.codeBox}>
              <Text style={styles.codeLabel}>{t.pairing.yourCode}</Text>
              <Text style={styles.code}>{lovedOne.pairingCode}</Text>
            </View>

            {lovedOne.paired ? (
              <View style={styles.paired}>
                <Icon name="check-circle" size={26} color={colors.calmInk} strokeWidth={2.2} />
                <Text style={styles.pairedText}>{t.pairing.connectedTo(lovedOne.relationship)}</Text>
              </View>
            ) : (
              <BigButton
                icon="link"
                label={t.pairing.markConnected}
                sublabel={t.pairing.markConnectedSub}
                variant="accent"
                size="xl"
                onPress={() => updateLovedOne({ paired: true })}
                style={{ marginTop: space.lg }}
              />
            )}
          </>
        ) : (
          <Text style={styles.sub}>{t.pairing.askFamilyFirst}</Text>
        )}

        <BigButton label={t.common.done} variant="ghost" onPress={() => navigation.goBack()} style={{ marginTop: space.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  scroll: { padding: space.lg },
  title: { fontFamily: font.display, fontSize: type.seniorTitle, color: colors.ink },
  sub: { fontFamily: font.body, fontSize: type.seniorBody, color: colors.inkSoft, marginTop: space.md, lineHeight: type.seniorBody * 1.35 },
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
  code: { fontFamily: font.display, fontSize: 60, letterSpacing: 10, color: colors.accentInk, marginTop: space.sm },
  paired: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    marginTop: space.lg,
    backgroundColor: colors.calmSoft,
    borderRadius: radius.md,
    padding: space.lg,
  },
  pairedText: { fontFamily: font.headingMed, fontSize: type.seniorBody, color: colors.calmInk },
});
