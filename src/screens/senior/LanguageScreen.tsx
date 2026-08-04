import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../../lib/store';
import { useT, LANGUAGES, DEFAULT_LANG } from '../../i18n';
import { BigButton } from '../../components/ui/BigButton';
import { Icon } from '../../components/ui/Icon';
import { colors, space, type, radius, font } from '../../theme/tokens';
import type { SeniorProps } from '../../navigation/types';

export function LanguageScreen({ navigation }: SeniorProps<'Language'>) {
  const language = useStore((s) => s.lovedOne?.language);
  const { t, setLang } = useT();
  const current = language ?? DEFAULT_LANG;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>{t.language.title}</Text>
        <Text style={styles.sub}>{t.language.sub}</Text>

        {LANGUAGES.map((l) => {
          const active = l.code === current;
          return (
            <Pressable
              key={l.code}
              onPress={() => setLang(l.code)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`${l.nativeLabel}. ${l.englishLabel}`}
              style={[styles.row, active && styles.rowActive]}
            >
              <View style={{ flex: 1 }}>
                {/* System font (no custom family) so every script renders regardless
                    of the currently active language. */}
                <Text style={styles.native}>{l.nativeLabel}</Text>
                <Text style={styles.eng}>{l.englishLabel}</Text>
              </View>
              {active ? (
                <Icon name="check-circle" size={28} color={colors.accent} strokeWidth={2.2} />
              ) : (
                <View style={styles.radio} />
              )}
            </Pressable>
          );
        })}

        <BigButton
          icon="volume"
          label={t.voicePicker.title}
          variant="neutral"
          onPress={() => navigation.navigate('VoicePicker')}
          style={{ marginTop: space.lg }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  scroll: { padding: space.lg },
  title: { fontFamily: font.display, fontSize: type.seniorTitle, color: colors.ink },
  sub: { fontFamily: font.body, fontSize: type.body, color: colors.inkSoft, marginTop: space.xs, marginBottom: space.lg },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.line,
    padding: space.lg,
    marginBottom: space.md,
    minHeight: 76,
  },
  rowActive: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  native: { fontFamily: undefined, fontWeight: '600', fontSize: type.seniorBody, color: colors.ink },
  eng: { fontFamily: undefined, fontSize: type.caption, color: colors.inkSoft, marginTop: 2 },
  radio: {
    width: 26,
    height: 26,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.lineStrong,
  },
});
