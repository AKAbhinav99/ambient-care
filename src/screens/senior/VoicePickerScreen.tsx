import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../../lib/store';
import { useT, DEFAULT_LANG, langMeta } from '../../i18n';
import { say } from '../../lib/speech';
import { listVoicesForLanguage, type VoiceGender, type VoiceOption } from '../../lib/voices';
import { Icon } from '../../components/ui/Icon';
import { colors, space, type, radius, font } from '../../theme/tokens';
import type { SeniorProps } from '../../navigation/types';

const NORMAL_RATE = 0.92;
const SLOW_RATE = 0.75;

export function VoicePickerScreen(_: SeniorProps<'VoicePicker'>) {
  const language = useStore((s) => s.lovedOne?.language) ?? DEFAULT_LANG;
  const voiceId = useStore((s) => s.lovedOne?.voiceId);
  const speechRate = useStore((s) => s.lovedOne?.speechRate) ?? NORMAL_RATE;
  const updateLovedOne = useStore((s) => s.updateLovedOne);
  const { t } = useT();

  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;
    setLoading(true);
    listVoicesForLanguage(language).then((v) => {
      if (live) {
        setVoices(v);
        setLoading(false);
      }
    });
    return () => {
      live = false;
    };
  }, [language]);

  // Selecting a voice both persists it and previews it — say() reads the freshly
  // stored voice (Zustand set is synchronous).
  const selectAndPreview = (v: VoiceOption) => {
    updateLovedOne({ voiceId: v.id, voiceRegion: v.region });
    say(t.spoken.voicePreview);
  };

  const setRate = (rate: number) => {
    updateLovedOne({ speechRate: rate });
    say(t.spoken.voicePreview);
  };

  const genderLabel = (g: VoiceGender): string =>
    g === 'male' ? t.voicePicker.male : g === 'female' ? t.voicePicker.female : t.voicePicker.other;

  const regions = Array.from(new Set(voices.map((v) => v.region)));

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>{t.voicePicker.title}</Text>
        <Text style={styles.sub}>{t.voicePicker.sub}</Text>

        {/* Speaking speed */}
        <Text style={styles.sectionLabel}>{t.voicePicker.speed}</Text>
        <View style={styles.speedRow}>
          <SpeedChip label={t.voicePicker.slow} active={speechRate <= SLOW_RATE} onPress={() => setRate(SLOW_RATE)} />
          <SpeedChip label={t.voicePicker.normal} active={speechRate > SLOW_RATE} onPress={() => setRate(NORMAL_RATE)} />
        </View>

        {loading ? (
          <ActivityIndicator color={colors.accent} size="large" style={{ marginTop: space.xl }} />
        ) : voices.length === 0 ? (
          <View style={styles.emptyCard}>
            <Icon name="volume-off" size={30} color={colors.checkInInk} strokeWidth={2} />
            <Text style={styles.emptyTitle}>{t.voicePicker.noVoiceTitle}</Text>
            <Text style={styles.emptyBody}>{t.voicePicker.noVoiceBody(langMeta(language).nativeLabel)}</Text>
          </View>
        ) : (
          regions.map((region) => {
            const inRegion = voices.filter((v) => v.region === region);
            return (
              <View key={region} style={styles.regionBlock}>
                <Text style={styles.regionLabel}>
                  {t.voicePicker.accent} · {inRegion[0].regionLabel}
                </Text>
                {inRegion.map((v) => {
                  const active = v.id === voiceId;
                  return (
                    <Pressable
                      key={v.id}
                      onPress={() => selectAndPreview(v)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      style={[styles.voiceRow, active && styles.voiceRowActive]}
                    >
                      <View style={styles.iconWell}>
                        <Icon name="volume" size={20} color={colors.accentInk} strokeWidth={2} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.voiceName}>{v.name}</Text>
                        <Text style={styles.voiceMeta}>{genderLabel(v.gender)}</Text>
                      </View>
                      {active ? (
                        <View style={styles.selectedTag}>
                          <Icon name="check" size={16} color={colors.onAccent} strokeWidth={2.6} />
                          <Text style={styles.selectedText}>{t.voicePicker.selected}</Text>
                        </View>
                      ) : (
                        <Text style={styles.previewText}>{t.voicePicker.preview}</Text>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            );
          })
        )}

        <Text style={styles.hint}>{t.voicePicker.moreVoices}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function SpeedChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.speedChip, active && styles.speedChipOn]}>
      <Text style={[styles.speedChipText, active && styles.speedChipTextOn]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  scroll: { padding: space.lg },
  title: { fontFamily: font.display, fontSize: type.seniorTitle, color: colors.ink },
  sub: { fontFamily: font.body, fontSize: type.body, color: colors.inkSoft, marginTop: space.xs, marginBottom: space.lg },

  sectionLabel: {
    fontFamily: font.bodyBold,
    fontSize: type.caption,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: colors.inkFaint,
    marginBottom: space.sm,
  },
  speedRow: { flexDirection: 'row', gap: space.sm, marginBottom: space.lg },
  speedChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: space.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    backgroundColor: colors.surface,
  },
  speedChipOn: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  speedChipText: { fontFamily: font.bodyBold, fontSize: type.bodyLg, color: colors.inkSoft },
  speedChipTextOn: { color: colors.accentInk },

  regionBlock: { marginBottom: space.md },
  regionLabel: {
    fontFamily: font.bodyBold,
    fontSize: type.caption,
    letterSpacing: 0.6,
    color: colors.inkFaint,
    marginBottom: space.sm,
  },
  voiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.line,
    padding: space.md,
    marginBottom: space.sm,
    minHeight: 64,
  },
  voiceRowActive: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  iconWell: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceName: { fontFamily: font.headingMed, fontSize: type.bodyLg, color: colors.ink },
  voiceMeta: { fontFamily: font.body, fontSize: type.caption, color: colors.inkSoft, marginTop: 2 },
  selectedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingVertical: 4,
    paddingHorizontal: space.sm,
  },
  selectedText: { color: colors.onAccent, fontFamily: font.bodyBold, fontSize: type.caption },
  previewText: { color: colors.accentInk, fontFamily: font.bodyMed, fontSize: type.body },

  emptyCard: {
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: colors.checkInSoft,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.checkIn,
    padding: space.xl,
    marginTop: space.md,
  },
  emptyTitle: { fontFamily: font.headingBold, fontSize: type.bodyLg, color: colors.checkInInk, textAlign: 'center' },
  emptyBody: { fontFamily: font.body, fontSize: type.body, color: colors.inkSoft, textAlign: 'center', lineHeight: type.body * 1.4 },

  hint: {
    fontFamily: font.body,
    fontSize: type.caption,
    color: colors.inkFaint,
    marginTop: space.md,
    lineHeight: type.caption * 1.5,
  },
});
