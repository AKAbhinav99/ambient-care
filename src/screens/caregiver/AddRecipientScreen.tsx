import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../../lib/store';
import { LANGUAGES, DEFAULT_LANG } from '../../i18n';
import { Card, SectionLabel } from '../../components/ui/Card';
import { BigButton } from '../../components/ui/BigButton';
import { Field } from '../../components/ui/Field';
import { Icon } from '../../components/ui/Icon';
import { colors, space, type, radius, font } from '../../theme/tokens';
import type { CaregiverProps } from '../../navigation/types';
import type { EmergencyContact } from '../../types';
import type { LangCode } from '../../i18n/config';

function fromCsv(s: string): string[] {
  return s
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

export function AddRecipientScreen({ navigation }: CaregiverProps<'AddRecipient'>) {
  const createLovedOne = useStore((s) => s.createLovedOne);
  const updateLovedOne = useStore((s) => s.updateLovedOne);

  const [name, setName] = useState('');
  const [rel, setRel] = useState('');
  const [language, setLanguage] = useState<LangCode>(DEFAULT_LANG);
  const [dob, setDob] = useState('');
  const [conditions, setConditions] = useState('');
  const [allergies, setAllergies] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [ambient, setAmbient] = useState(false);
  const [createdCode, setCreatedCode] = useState<string | null>(null);

  const canCreate = name.trim().length > 0 && rel.trim().length > 0;

  const create = () => {
    createLovedOne(name, rel);
    const contacts: EmergencyContact[] =
      contactName.trim() && contactPhone.trim()
        ? [{ name: contactName.trim(), relationship: 'Emergency contact', phone: contactPhone.trim() }]
        : [];
    updateLovedOne({
      language,
      dob: dob.trim() || undefined,
      conditions: fromCsv(conditions),
      allergies: fromCsv(allergies),
      emergencyContacts: contacts,
      ambientOptIn: ambient,
    });
    setCreatedCode(useStore.getState().lovedOne?.pairingCode ?? null);
  };

  if (createdCode) {
    return <CodeResult name={name.trim()} code={createdCode} onDone={() => navigation.navigate('Recipients')} />;
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Add a care recipient</Text>
        <Text style={styles.sub}>A few basics so the home device can help them properly.</Text>

        <SectionLabel>The essentials</SectionLabel>
        <Card style={{ marginBottom: space.lg }}>
          <Field label="Their name" value={name} onChangeText={setName} placeholder="Rose" autoCapitalize="words" />
          <Field label="Your relationship to them" value={rel} onChangeText={setRel} placeholder="Mother" autoCapitalize="words" />
          <Field label="Date of birth" value={dob} onChangeText={setDob} placeholder="1944-03-12" autoCapitalize="none" />
        </Card>

        <SectionLabel>Language of the home device</SectionLabel>
        <Card style={{ marginBottom: space.lg }}>
          <View style={styles.langWrap}>
            {LANGUAGES.map((l) => {
              const active = language === l.code;
              return (
                <Pressable
                  key={l.code}
                  onPress={() => setLanguage(l.code)}
                  style={[styles.langChip, active && styles.langChipOn]}
                >
                  <Text style={[styles.langNative, active && styles.langTextOn]}>{l.nativeLabel}</Text>
                  <Text style={[styles.langEng, active && styles.langTextOn]}>{l.englishLabel}</Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        <SectionLabel>Health basics (for the emergency card)</SectionLabel>
        <Card style={{ marginBottom: space.lg }}>
          <Field label="Conditions (comma-separated)" value={conditions} onChangeText={setConditions} placeholder="Atrial fibrillation, Diabetes" />
          <Field label="Allergies (comma-separated)" value={allergies} onChangeText={setAllergies} placeholder="Penicillin, Sulfa" />
        </Card>

        <SectionLabel>An emergency contact (optional)</SectionLabel>
        <Card style={{ marginBottom: space.lg }}>
          <Field label="Name" value={contactName} onChangeText={setContactName} placeholder="Alex Rivera" autoCapitalize="words" />
          <Field label="Phone" value={contactPhone} onChangeText={setContactPhone} placeholder="+15125550110" autoCapitalize="none" keyboardType="phone-pad" />
        </Card>

        <SectionLabel>Safety listening</SectionLabel>
        <Pressable onPress={() => setAmbient((v) => !v)}>
          <Card style={[styles.consent, ambient && styles.consentOn]}>
            <View style={{ flex: 1, paddingRight: space.md }}>
              <Text style={styles.consentTitle}>Listen for falls & distress</Text>
              <Text style={styles.consentDesc}>
                Audio is analyzed on the device — nothing is recorded or stored. You can change this
                anytime.
              </Text>
            </View>
            <View style={[styles.switch, ambient && styles.switchOn]}>
              <View style={[styles.knob, ambient && styles.knobOn]} />
            </View>
          </Card>
        </Pressable>

        <BigButton
          icon="check"
          label="Create profile & get code"
          variant="accent"
          disabled={!canCreate}
          onPress={create}
          style={{ marginTop: space.lg }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function CodeResult({ name, code, onDone }: { name: string; code: string; onDone: () => void }) {
  const share = () =>
    Share.share({ message: `Connect ${name}'s Ambient Care home device with this code: ${code}` }).catch(() => {});
  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={[styles.scroll, styles.resultScroll]}>
        <View style={styles.check}>
          <Icon name="check-circle" size={40} color={colors.calm} strokeWidth={2.2} />
        </View>
        <Text style={styles.resultTitle}>{name} is set up</Text>
        <Text style={styles.resultSub}>
          On {name}'s home device, choose “This is a home device” and enter this code:
        </Text>

        <View style={styles.codeBox}>
          <Text style={styles.bigCode}>{code}</Text>
        </View>

        <BigButton icon="link" label="Share the code" variant="neutral" onPress={share} style={{ marginTop: space.lg }} />
        <BigButton icon="check" label="Done" variant="accent" onPress={onDone} style={{ marginTop: space.md }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  scroll: { padding: space.lg },
  title: { fontFamily: font.display, fontSize: type.headline, color: colors.ink },
  sub: { fontFamily: font.body, fontSize: type.body, color: colors.inkSoft, marginTop: space.xs, marginBottom: space.lg, lineHeight: type.body * 1.4 },

  langWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  langChip: {
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    backgroundColor: colors.surface,
    minWidth: 100,
  },
  langChipOn: { borderColor: colors.accent, backgroundColor: colors.accent },
  langNative: { fontFamily: undefined, fontWeight: '700', fontSize: type.body, color: colors.ink },
  langEng: { fontFamily: undefined, fontSize: type.caption, color: colors.inkSoft, marginTop: 2 },
  langTextOn: { color: colors.onAccent },

  consent: { flexDirection: 'row', alignItems: 'center' },
  consentOn: { backgroundColor: colors.accentSoft, borderColor: colors.accent },
  consentTitle: { fontFamily: font.headingBold, fontSize: type.bodyLg, color: colors.ink },
  consentDesc: { fontFamily: font.body, fontSize: type.caption, color: colors.inkSoft, marginTop: 4, lineHeight: type.caption * 1.5 },
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

  resultScroll: { flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
  check: { marginBottom: space.md },
  resultTitle: { fontFamily: font.display, fontSize: type.title, color: colors.ink, textAlign: 'center' },
  resultSub: { fontFamily: font.body, fontSize: type.body, color: colors.inkSoft, textAlign: 'center', marginTop: space.sm, lineHeight: type.body * 1.4 },
  codeBox: {
    marginTop: space.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.accent,
    paddingHorizontal: space.xl,
    paddingVertical: space.lg,
  },
  bigCode: { fontFamily: font.display, fontSize: 48, letterSpacing: 8, color: colors.accentInk },
});
