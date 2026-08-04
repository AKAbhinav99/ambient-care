import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../../lib/store';
import { LANGUAGES, DEFAULT_LANG } from '../../i18n';
import { Card, SectionLabel } from '../../components/ui/Card';
import { BigButton } from '../../components/ui/BigButton';
import { Field } from '../../components/ui/Field';
import { Icon } from '../../components/ui/Icon';
import { colors, space, type, radius, font } from '../../theme/tokens';
import type { CaregiverProps } from '../../navigation/types';
import type { EmergencyContact, LovedOne } from '../../types';

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
            icon="check"
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
              <View style={styles.pairedIconWell}>
                <Icon name="link" size={22} color={colors.calmInk} strokeWidth={2} />
              </View>
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

        {/* Language for the home device */}
        <SectionLabel>Language & voice</SectionLabel>
        <Card style={{ marginBottom: space.lg }}>
          <Text style={styles.modeNote}>
            The home device shows and speaks in this language. {lovedOne.name} can also change it —
            and pick a voice (accent, male or female) — in the device's settings.
          </Text>
          <View style={styles.langWrap}>
            {LANGUAGES.map((l) => {
              const active = (lovedOne.language ?? DEFAULT_LANG) === l.code;
              return (
                <Pressable
                  key={l.code}
                  onPress={() => updateLovedOne({ language: l.code })}
                  style={[styles.langChip, active && styles.langChipOn]}
                >
                  <Text style={[styles.langChipNative, active && styles.langChipTextOn]}>{l.nativeLabel}</Text>
                  <Text style={[styles.langChipEng, active && styles.langChipTextOn]}>{l.englishLabel}</Text>
                </Pressable>
              );
            })}
          </View>
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

        <MedicalProfile lovedOne={lovedOne} navigation={navigation} />

        <BigButton
          icon="arrow-left"
          label="Back to dashboard"
          variant="neutral"
          onPress={() => navigation.navigate('CaregiverHome')}
          style={{ marginTop: space.lg }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function fromCsv(s: string): string[] {
  return s
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

function MedicalProfile({
  lovedOne,
  navigation,
}: {
  lovedOne: LovedOne;
  navigation: CaregiverProps<'LovedOne'>['navigation'];
}) {
  const updateLovedOne = useStore((s) => s.updateLovedOne);
  const [dob, setDob] = useState(lovedOne.dob ?? '');
  const [bloodType, setBloodType] = useState(lovedOne.bloodType ?? '');
  const [allergies, setAllergies] = useState((lovedOne.allergies ?? []).join(', '));
  const [conditions, setConditions] = useState((lovedOne.conditions ?? []).join(', '));
  const [doctor, setDoctor] = useState(lovedOne.doctor ?? '');
  const [pharmacy, setPharmacy] = useState(lovedOne.pharmacy ?? '');
  const [notes, setNotes] = useState(lovedOne.medicalNotes ?? '');
  const [contacts, setContacts] = useState<EmergencyContact[]>(lovedOne.emergencyContacts ?? []);
  const [cName, setCName] = useState('');
  const [cRel, setCRel] = useState('');
  const [cPhone, setCPhone] = useState('');

  const addContact = () => {
    if (!cName.trim() || !cPhone.trim()) return;
    setContacts([
      ...contacts,
      { name: cName.trim(), relationship: cRel.trim() || 'Contact', phone: cPhone.trim() },
    ]);
    setCName('');
    setCRel('');
    setCPhone('');
  };

  const save = () => {
    updateLovedOne({
      dob: dob.trim() || undefined,
      bloodType: bloodType.trim() || undefined,
      allergies: fromCsv(allergies),
      conditions: fromCsv(conditions),
      doctor: doctor.trim() || undefined,
      pharmacy: pharmacy.trim() || undefined,
      medicalNotes: notes.trim() || undefined,
      emergencyContacts: contacts,
    });
    Alert.alert('Saved', 'Emergency card updated.');
  };

  return (
    <>
      <SectionLabel>Medical profile (emergency card)</SectionLabel>
      <Card style={{ marginBottom: space.lg }}>
        <Field label="Date of birth" value={dob} onChangeText={setDob} placeholder="1944-03-12" autoCapitalize="none" />
        <Field label="Blood type" value={bloodType} onChangeText={setBloodType} placeholder="O+" autoCapitalize="characters" />
        <Field label="Allergies (comma-separated)" value={allergies} onChangeText={setAllergies} placeholder="Penicillin, Sulfa" />
        <Field
          label="Conditions (comma-separated)"
          value={conditions}
          onChangeText={setConditions}
          placeholder="Atrial fibrillation, Diabetes"
        />
        <Field label="Doctor" value={doctor} onChangeText={setDoctor} placeholder="Dr. Ede — (512) 555-0140" />
        <Field label="Pharmacy" value={pharmacy} onChangeText={setPharmacy} placeholder="CVS on Main — (512) 555-0170" />
        <Field label="Notes" value={notes} onChangeText={setNotes} placeholder="Pacemaker since 2019" />

        <Text style={styles.profileLabel}>Emergency contacts</Text>
        {contacts.map((c, i) => (
          <View key={`${c.phone}-${i}`} style={styles.contactRow}>
            <Text style={styles.contactText}>
              {c.name} · {c.relationship} · {c.phone}
            </Text>
            <Pressable onPress={() => setContacts(contacts.filter((_, idx) => idx !== i))} hitSlop={8}>
              <Text style={styles.remove}>Remove</Text>
            </Pressable>
          </View>
        ))}
        <Field label="Contact name" value={cName} onChangeText={setCName} placeholder="Alex Rivera" autoCapitalize="words" />
        <Field label="Relationship" value={cRel} onChangeText={setCRel} placeholder="Daughter" autoCapitalize="words" />
        <Field
          label="Phone"
          value={cPhone}
          onChangeText={setCPhone}
          placeholder="+15125550110"
          autoCapitalize="none"
          keyboardType="phone-pad"
        />
        <BigButton label="Add contact" variant="ghost" onPress={addContact} />

        <View style={{ height: space.md }} />
        <BigButton label="Save profile" variant="accent" onPress={save} />
        <BigButton
          label="Preview emergency card"
          variant="neutral"
          onPress={() => navigation.navigate('EmergencyCard')}
          style={{ marginTop: space.sm }}
        />
      </Card>
    </>
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
  title: { fontFamily: font.display, fontSize: type.headline, color: colors.ink },
  sub: { fontFamily: font.body, fontSize: type.body, color: colors.inkFaint, marginBottom: space.xl },

  pairCard: { marginBottom: space.lg, alignItems: 'center' },
  codeLabel: { fontSize: type.caption, color: colors.inkSoft, fontWeight: '600' },
  code: {
    fontFamily: font.display,
    fontSize: 44,
    letterSpacing: 8,
    color: colors.accentInk,
    marginVertical: space.sm,
  },
  codeHint: { fontSize: type.caption, color: colors.inkFaint, textAlign: 'center', lineHeight: type.caption * 1.5 },
  demoPair: { marginTop: space.md },
  link: { color: colors.accentInk, fontWeight: '700', fontSize: type.body },

  profileLabel: { fontSize: type.caption, fontWeight: '700', color: colors.inkSoft, marginTop: space.sm, marginBottom: space.xs },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: space.xs,
  },
  contactText: { flex: 1, fontSize: type.body, color: colors.ink },
  remove: { color: colors.urgent, fontWeight: '600', fontSize: type.caption },
  pairedRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  pairedIconWell: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.calmSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pairedTitle: { fontFamily: font.headingBold, fontSize: type.bodyLg, color: colors.calmInk },
  pairedSub: { fontSize: type.body, color: colors.inkSoft },

  toggleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: space.xs },
  toggleTitle: { fontSize: type.bodyLg, fontWeight: '700', color: colors.ink },
  toggleDesc: { fontSize: type.caption, color: colors.inkSoft, marginTop: 4, lineHeight: type.caption * 1.5 },
  divider: { height: 1, backgroundColor: colors.line, marginVertical: space.sm },
  modeNote: { fontSize: type.caption, color: colors.inkFaint, lineHeight: type.caption * 1.5 },

  langWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.md },
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
  // System font (no custom family) so non-Latin native labels render on the
  // English caregiver surface.
  langChipNative: { fontFamily: undefined, fontWeight: '700', fontSize: type.body, color: colors.ink },
  langChipEng: { fontFamily: undefined, fontSize: type.caption, color: colors.inkSoft, marginTop: 2 },
  langChipTextOn: { color: colors.onAccent },

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
