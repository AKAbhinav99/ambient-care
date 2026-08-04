import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../../lib/store';
import { Card, SectionLabel } from '../../components/ui/Card';
import { BigButton } from '../../components/ui/BigButton';
import { Field } from '../../components/ui/Field';
import { colors, space, type, radius } from '../../theme/tokens';
import type { MedSchedule } from '../../types';

const SCHEDULES: { key: MedSchedule; label: string }[] = [
  { key: 'morning', label: 'Morning' },
  { key: 'midday', label: 'Midday' },
  { key: 'evening', label: 'Evening' },
  { key: 'bedtime', label: 'Bedtime' },
  { key: 'asNeeded', label: 'As needed' },
];

export function MedicationSetup() {
  const medications = useStore((s) => s.medications);
  const addMedication = useStore((s) => s.addMedication);
  const removeMedication = useStore((s) => s.removeMedication);

  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [friendly, setFriendly] = useState('');
  const [barcode, setBarcode] = useState('');
  const [schedule, setSchedule] = useState<MedSchedule>('morning');
  const [adding, setAdding] = useState(false);

  const reset = () => {
    setName('');
    setDosage('');
    setFriendly('');
    setBarcode('');
    setSchedule('morning');
    setAdding(false);
  };

  const submit = () => {
    addMedication({
      name: name.trim(),
      dosage: dosage.trim() || '1 pill',
      friendlyName: friendly.trim() || `your ${name.trim().toLowerCase()}`,
      schedule,
      barcode: barcode.trim() || undefined,
    });
    reset();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Medications</Text>
        <Text style={styles.sub}>
          Log each one ahead of time so the home device can recognize it when scanned.
        </Text>

        {medications.length > 0 ? (
          <>
            <SectionLabel>On file ({medications.length})</SectionLabel>
            {medications.map((m) => (
              <Card key={m.id} raised={false} style={styles.medRow}>
                <View style={styles.medIcon}>
                  <Text style={{ fontSize: 22 }}>💊</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.medName}>{m.name}</Text>
                  <Text style={styles.medMeta}>
                    {m.dosage} · {scheduleLabel(m.schedule)}
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

            <Text style={styles.fieldLabel}>Schedule</Text>
            <View style={styles.segments}>
              {SCHEDULES.map((s) => (
                <Pressable
                  key={s.key}
                  onPress={() => setSchedule(s.key)}
                  style={[styles.segment, schedule === s.key && styles.segmentOn]}
                >
                  <Text style={[styles.segmentText, schedule === s.key && styles.segmentTextOn]}>
                    {s.label}
                  </Text>
                </Pressable>
              ))}
            </View>

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
            icon="➕"
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

function scheduleLabel(s: MedSchedule) {
  return SCHEDULES.find((x) => x.key === s)?.label ?? s;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  scroll: { padding: space.lg },
  title: { fontSize: type.headline, fontWeight: '800', color: colors.ink },
  sub: { fontSize: type.body, color: colors.inkSoft, marginTop: 4, marginBottom: space.lg, lineHeight: type.body * 1.4 },

  medRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginBottom: space.sm },
  medIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medName: { fontSize: type.bodyLg, fontWeight: '700', color: colors.ink },
  medMeta: { fontSize: type.caption, color: colors.inkSoft, marginTop: 2 },
  medFriendly: { fontSize: type.caption, color: colors.accentInk, marginTop: 2, fontStyle: 'italic' },
  remove: { color: colors.urgent, fontWeight: '600', fontSize: type.caption },

  form: { marginTop: space.md },
  fieldLabel: { fontSize: type.caption, fontWeight: '700', color: colors.inkSoft, marginBottom: space.xs },
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
  formActions: { flexDirection: 'row', gap: space.sm, marginTop: space.lg },
});
