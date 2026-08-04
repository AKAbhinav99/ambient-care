import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../../lib/store';
import { useT } from '../../i18n';
import { Card } from '../../components/ui/Card';
import { BigButton } from '../../components/ui/BigButton';
import { Icon, type IconName } from '../../components/ui/Icon';
import { colors, space, type, radius, font } from '../../theme/tokens';
import type { SeniorProps } from '../../navigation/types';

export function SeniorSettings({ navigation }: SeniorProps<'SeniorSettings'>) {
  const lovedOne = useStore((s) => s.lovedOne);
  const updateLovedOne = useStore((s) => s.updateLovedOne);
  const signOut = useStore((s) => s.signOut);
  const { t } = useT();

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>{t.settings.title}</Text>

        {lovedOne ? (
          <>
            <ToggleCard
              icon="settings"
              title={t.settings.alwaysOnTitle}
              desc={t.settings.alwaysOnDesc}
              value={lovedOne.alwaysOnMode}
              onToggle={(v) => updateLovedOne({ alwaysOnMode: v })}
            />

            <ToggleCard
              icon="volume"
              title={t.settings.listenTitle}
              desc={t.settings.listenDesc}
              value={lovedOne.ambientOptIn}
              onToggle={(v) => updateLovedOne({ ambientOptIn: v })}
              highlight
            />

            {/* The orange-dot explainer */}
            <Card raised={false} style={styles.dotCard}>
              <View style={styles.dotRow}>
                <View style={styles.orangeDot} />
                <Text style={styles.dotTitle}>{t.settings.orangeDotTitle}</Text>
              </View>
              <Text style={styles.dotText}>{t.settings.orangeDotText}</Text>
            </Card>
          </>
        ) : (
          <Text style={styles.note}>{t.settings.askFamilySetup}</Text>
        )}

        <BigButton
          icon="volume"
          label={t.settings.languageVoice}
          variant="neutral"
          onPress={() => navigation.navigate('Language')}
          style={{ marginTop: space.lg }}
        />

        <BigButton
          icon="link"
          label={t.settings.connectFamily}
          variant="neutral"
          onPress={() => navigation.navigate('Pairing')}
          style={{ marginTop: space.md }}
        />

        <Pressable
          onPress={() =>
            Alert.alert(t.settings.switchRoleTitle, t.settings.switchRoleBody, [
              { text: t.common.cancel, style: 'cancel' },
              { text: t.settings.switchBtn, onPress: signOut },
            ])
          }
          style={styles.switchRole}
        >
          <Text style={styles.switchText}>{t.settings.switchRoleLink}</Text>
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
  icon: IconName;
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
          <View style={styles.toggleIconWell}>
            <Icon name={icon} size={22} color={colors.accentInk} strokeWidth={2} />
          </View>
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
  title: { fontFamily: font.display, fontSize: type.seniorTitle, color: colors.ink, marginBottom: space.lg },
  note: { fontSize: type.body, color: colors.inkSoft },

  toggleCard: { marginBottom: space.md },
  toggleHead: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  toggleIconWell: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleTitle: { flex: 1, fontFamily: font.headingBold, fontSize: type.bodyLg, color: colors.ink },
  toggleDesc: { fontFamily: font.body, fontSize: type.body, color: colors.inkSoft, marginTop: space.sm, lineHeight: type.body * 1.4 },

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
