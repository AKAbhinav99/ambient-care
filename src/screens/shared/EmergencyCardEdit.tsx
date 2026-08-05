/**
 * Caregiver-only inline editor for the Emergency Med Card.
 *
 * Reached from the "Edit" affordance on the card itself (gated to the caregiver
 * role), so a family member can change the card directly from where they're
 * looking at it — not only buried in Loved One setup. Caregiver-facing, so the
 * copy stays English like the rest of that surface.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../../lib/store';
import { Card } from '../../components/ui/Card';
import { BigButton } from '../../components/ui/BigButton';
import { Field } from '../../components/ui/Field';
import { colors, space, type, font } from '../../theme/tokens';
import type { EmergencyContact, LovedOne } from '../../types';

function fromCsv(s: string): string[] {
  return s
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

export function EmergencyCardEdit({ lovedOne, onDone }: { lovedOne: LovedOne; onDone: () => void }) {
  const updateLovedOne = useStore((s) => s.updateLovedOne);
  const [name, setName] = useState(lovedOne.name);
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
      name: name.trim() || lovedOne.name,
      dob: dob.trim() || undefined,
      bloodType: bloodType.trim() || undefined,
      allergies: fromCsv(allergies),
      conditions: fromCsv(conditions),
      doctor: doctor.trim() || undefined,
      pharmacy: pharmacy.trim() || undefined,
      medicalNotes: notes.trim() || undefined,
      emergencyContacts: contacts,
    });
    onDone();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Edit emergency card</Text>
        <Text style={styles.sub}>
          Only you can change this. {lovedOne.name} sees the finished card, ready to show a first
          responder.
        </Text>

        <Card style={{ marginTop: space.lg }}>
          <Field label="Name" value={name} onChangeText={setName} autoCapitalize="words" />
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
        </Card>

        <Text style={styles.section}>Emergency contacts</Text>
        <Card>
          {contacts.length === 0 ? <Text style={styles.none}>None yet.</Text> : null}
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
        </Card>

        <BigButton icon="check" label="Save card" variant="accent" onPress={save} style={{ marginTop: space.lg }} />
        <BigButton label="Cancel" variant="neutral" onPress={onDone} style={{ marginTop: space.sm }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  scroll: { padding: space.lg },
  title: { fontFamily: font.display, fontSize: type.headline, color: colors.ink },
  sub: { fontFamily: font.body, fontSize: type.body, color: colors.inkSoft, marginTop: space.xs, lineHeight: type.body * 1.4 },
  section: {
    fontFamily: font.bodyBold,
    fontSize: type.caption,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: colors.inkFaint,
    marginTop: space.lg,
    marginBottom: space.sm,
  },
  none: { fontSize: type.body, color: colors.inkFaint, marginBottom: space.sm },
  contactRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: space.xs },
  contactText: { flex: 1, fontSize: type.body, color: colors.ink, paddingRight: space.sm },
  remove: { color: colors.urgent, fontWeight: '600', fontSize: type.caption },
});
