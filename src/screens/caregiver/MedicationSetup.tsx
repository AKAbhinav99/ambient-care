import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../../lib/store';
import { Card, SectionLabel } from '../../components/ui/Card';
import { BigButton } from '../../components/ui/BigButton';
import { Field } from '../../components/ui/Field';
import { InteractionWarning } from '../../components/InteractionWarning';
import { Icon } from '../../components/ui/Icon';
import { checkInteractions } from '../../lib/interactions';
import { DEFAULT_TIMES, medTimes } from '../../lib/adherence';
import { colors, space, type, radius, font } from '../../theme/tokens';
import type { MedSchedule } from '../../types';
import type { CaregiverProps } from '../../navigation/types';

const SCHEDULES: { key: MedSchedule; label: string }[] = [
  { key: 'morning', label: 'Morning' },
  { key: 'midday', label: 'Midday' },
  { key: 'evening', label: 'Evening' },
  { key: 'bedtime', label: 'Bedtime' },
  { key: 'asNeeded', label: 'As needed' },
];

const TIME_OPTIONS: { label: string; value: string }[] = [
  { label: 'Morning · 8:00', value: '08:00' },
  { label: 'Noon · 12:00', value: '12:00' },
  { label: 'Evening · 6:00', value: '18:00' },
  { label: 'Bedtime · 9:00', value: '21:00' },
];

const INLINE_WARNING_LIMIT = 3;

export function MedicationSetup({ navigation }: CaregiverProps<'Medications'>) {
  const medications = useStore((s) => s.medications);
  const addMedication = useStore((s) => s.addMedication);
  const removeMedication = useStore((s) => s.removeMedication);

  const warnings = useMemo(() => checkInteractions(medications), [medications]);

  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [friendly, setFriendly] = useState('');
  const [barcode, setBarcode] = useState('');
  const [pills, setPills] = useState('');
  const [schedule, setSchedule] = useState<MedSchedule>('morning');
  const [times, setTimes] = useState<string[]>(DEFAULT_TIMES.morning);
  const [critical, setCritical] = useState(false);
  const [adding, setAdding] = useState(false);

  const pickSchedule = (key: MedSchedule) => {
    setSchedule(key);
    setTimes(DEFAULT_TIMES[key]); // reset times to the schedule's default
  };

  const toggleTime = (value: string) =>
    setTimes((cur) => (cur.includes(value) ? cur.filter((t) => t !== value) : [...cur, value].sort()));

  const reset = () => {
    setName('');
    setDosage('');
    setFriendly('');
    setBarcode('');
    setPills('');
    setSchedule('morning');
    setTimes(DEFAULT_TIMES.morning);
    setCritical(false);
    setAdding(false);
  };

  const submit = () => {
    addMedication({
      name: name.trim(),
      dosage: dosage.trim() || '1 pill',
      friendlyName: friendly.trim() || `your ${name.trim().toLowerCase()}`,
      schedule,
      times: times.length ? times : undefined,
      barcode: barcode.trim() || undefined,
      critical: critical || undefined,
      pillsOnHand: pills.trim() ? Number(pills) : undefined,
    });
    reset();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Medications</Text>
        <Text style={styles.sub}>
          Log each one ahead of time so the home device can recognize it, remind on schedule, and
          watch for risky combinations.
        </Text>

        {/* Interaction warnings, right where meds are managed */}
        {warnings.length > 0 ? (
          <View style={styles.warnBlock}>
            <SectionLabel>Interaction check</SectionLabel>
            {warnings.slice(0, INLINE_WARNING_LIMIT).map((w, i) => (
              <InteractionWarning key={`${w.a}-${w.b}-${i}`} warning={w} />
            ))}
            <Pressable onPress={() => navigation.navigate('Interactions')}>
              <Text style={styles.link}>
                {warnings.length > INLINE_WARNING_LIMIT
                  ? `See all ${warnings.length} interactions →`
                  : 'Open full interaction review →'}
              </Text>
            </Pressable>
          </View>
        ) : null}

        {medications.length > 0 ? (
          <>
            <SectionLabel>On file ({medications.length})</SectionLabel>
            {medications.map((m) => (
              <Card key={m.id} raised={false} style={styles.medRow}>
                <View style={styles.medIcon}>
                  <Icon name="pill" size={22} color={colors.accentInk} strokeWidth={2} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.medName}>
                    {m.name}
                    {m.critical ? <Text style={styles.criticalTag}>  critical</Text> : null}
                  </Text>
                  <Text style={styles.medMeta}>
                    {m.dosage} · {medTimes(m).join(', ') || 'as needed'}
                    {typeof m.pillsOnHand === 'number' ? ` · ${m.pillsOnHand} left` : ''}
                    {m.barcode ? ' · barcode set' : ''}
                  </Text>
                  <Text style={styles.medFriendly}>“{m.friendlyName}”</Text>
                </View>
                <Pressable onPress={() => removeMedication(m.id)} hitSlop={10}>
                  <Text style={styles.remove}>Remove</Text>
                </Pressable>
              </Card>
            ))}
          </>
        ) : null}

        {adding ? (
          <Card style={styles.form}>
            <SectionLabel>New medication</SectionLabel>
            <Field label="Name" value={name} onChangeText={setName} placeholder="Lisinopril" autoCapitalize="words" />
            <Field label="Dosage" value={dosage} onChangeText={setDosage} placeholder="10mg — 1 pill" />
            <Field
              label="Spoken name (how the device refers to it)"
              value={friendly}
              onChangeText={setFriendly}
              placeholder="your blood pressure medicine"
              autoCapitalize="none"
            />
            <Field
              label="Barcode (optional — enables real scan matching)"
              value={barcode}
              onChangeText={setBarcode}
              placeholder="036800111213"
              autoCapitalize="none"
              keyboardType="number-pad"
            />
            <Field
              label="Pills on hand (optional — enables refill alerts)"
              value={pills}
              onChangeText={setPills}
              placeholder="30"
              autoCapitalize="none"
              keyboardType="number-pad"
            />

            <Text style={styles.fieldLabel}>Schedule</Text>
            <View style={styles.segments}>
              {SCHEDULES.map((s) => (
                <Pressable
                  key={s.key}
                  onPress={() => pickSchedule(s.key)}
                  style={[styles.segment, schedule === s.key && styles.segmentOn]}
                >
                  <Text style={[styles.segmentText, schedule === s.key && styles.segmentTextOn]}>
                    {s.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Dose times</Text>
            <View style={styles.segments}>
              {TIME_OPTIONS.map((t) => {
                const on = times.includes(t.value);
                return (
                  <Pressable
                    key={t.value}
                    onPress={() => toggleTime(t.value)}
                    style={[styles.segment, on && styles.segmentOn]}
                  >
                    <Text style={[styles.segmentText, on && styles.segmentTextOn]}>{t.label}</Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={styles.timesHint}>
              {times.length ? `Reminders at ${times.join(', ')}.` : 'No fixed times (as needed).'}
            </Text>

            <Pressable onPress={() => setCritical((v) => !v)} style={styles.criticalRow}>
              <View style={[styles.check, critical && styles.checkOn]}>
                {critical ? <Icon name="check" size={16} color="#fff" strokeWidth={3} /> : null}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.criticalTitle}>Critical medication</Text>
                <Text style={styles.criticalDesc}>A missed dose alerts the caregiver as urgent.</Text>
              </View>
            </Pressable>

            <View style={styles.formActions}>
              <BigButton label="Cancel" variant="ghost" onPress={reset} style={{ flex: 1 }} />
              <BigButton
                label="Save"
                variant="accent"
                disabled={!name.trim()}
                onPress={submit}
                style={{ flex: 1 }}
              />
            </View>
          </Card>
        ) : (
          <BigButton
            icon="plus"
            label="Add a medication"
            variant="accent"
            onPress={() => setAdding(true)}
            style={{ marginTop: space.md }}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  scroll: { padding: space.lg },
  title: { fontFamily: font.display, fontSize: type.headline, color: colors.ink },
  sub: { fontFamily: font.body, fontSize: type.body, color: colors.inkSoft, marginTop: 4, marginBottom: space.lg, lineHeight: type.body * 1.4 },

  warnBlock: { marginBottom: space.lg },
  link: { color: colors.accentInk, fontWeight: '700', fontSize: type.body, marginTop: space.xs },

  medRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginBottom: space.sm },
  medIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medName: { fontFamily: font.headingMed, fontSize: type.bodyLg, color: colors.ink },
  criticalTag: { fontFamily: font.bodyBold, fontSize: type.caption, color: colors.urgent },
  medMeta: { fontSize: type.caption, color: colors.inkSoft, marginTop: 2 },
  medFriendly: { fontSize: type.caption, color: colors.accentInk, marginTop: 2, fontStyle: 'italic' },
  remove: { color: colors.urgent, fontWeight: '600', fontSize: type.caption },

  form: { marginTop: space.md },
  fieldLabel: { fontSize: type.caption, fontWeight: '700', color: colors.inkSoft, marginBottom: space.xs, marginTop: space.sm },
  segments: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs },
  segment: {
    paddingVertical: space.xs,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surfaceSunken,
  },
  segmentOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  segmentText: { fontSize: type.caption, fontWeight: '600', color: colors.inkSoft },
  segmentTextOn: { color: colors.onAccent },
  timesHint: { fontSize: type.caption, color: colors.inkFaint, marginTop: space.xs },

  criticalRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginTop: space.md },
  check: {
    width: 26,
    height: 26,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOn: { backgroundColor: colors.urgent, borderColor: colors.urgent },
  checkMark: { color: '#fff', fontWeight: '900', fontSize: 16 },
  criticalTitle: { fontSize: type.body, fontWeight: '700', color: colors.ink },
  criticalDesc: { fontSize: type.caption, color: colors.inkSoft, marginTop: 2 },

  formActions: { flexDirection: 'row', gap: space.sm, marginTop: space.lg },
});
