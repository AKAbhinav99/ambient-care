import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Linking, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../../lib/store';
import { useT } from '../../i18n';
import { Icon } from '../../components/ui/Icon';
import { colors, space, type, radius, font } from '../../theme/tokens';
import type { LovedOne, Medication } from '../../types';

function ageFrom(dob?: string): number | null {
  if (!dob) return null;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
}

function buildShareText(lo: LovedOne, meds: Medication[]): string {
  const age = ageFrom(lo.dob);
  const lines = [
    `EMERGENCY MEDICAL CARD — ${lo.name}${age != null ? `, age ${age}` : ''}`,
    lo.bloodType ? `Blood type: ${lo.bloodType}` : null,
    lo.allergies?.length ? `Allergies: ${lo.allergies.join(', ')}` : 'Allergies: none recorded',
    lo.conditions?.length ? `Conditions: ${lo.conditions.join(', ')}` : null,
    '',
    'Medications:',
    ...(meds.length ? meds.map((m) => `• ${m.name} — ${m.dosage}${m.critical ? ' (critical)' : ''}`) : ['• none recorded']),
    '',
    lo.emergencyContacts?.length
      ? `Emergency contacts:\n${lo.emergencyContacts.map((c) => `• ${c.name} (${c.relationship}) — ${c.phone}`).join('\n')}`
      : null,
    lo.doctor ? `Doctor: ${lo.doctor}` : null,
    lo.pharmacy ? `Pharmacy: ${lo.pharmacy}` : null,
    lo.medicalNotes ? `Notes: ${lo.medicalNotes}` : null,
  ].filter(Boolean);
  return lines.join('\n');
}

export function EmergencyCardScreen() {
  const navigation = useNavigation();
  const lovedOne = useStore((s) => s.lovedOne);
  const medications = useStore((s) => s.medications);
  const { t } = useT();

  if (!lovedOne) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>{t.emergency.noProfile}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const age = ageFrom(lovedOne.dob);
  const call = (phone: string) => Linking.openURL(`tel:${phone.replace(/[^\d+]/g, '')}`);
  const onShare = () => Share.share({ message: buildShareText(lovedOne, medications) }).catch(() => {});

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View style={styles.badgeRow}>
            <Icon name="shield-plus" size={18} color={colors.urgent} strokeWidth={2.4} />
            <Text style={styles.badge}>{t.emergency.badge}</Text>
          </View>
          <Text style={styles.name}>
            {lovedOne.name}
            {age != null ? <Text style={styles.age}>{`  ·  ${t.emergency.age(age)}`}</Text> : null}
          </Text>
          {lovedOne.bloodType ? (
            <View style={styles.bloodChip}>
              <Text style={styles.bloodText}>{t.emergency.bloodType(lovedOne.bloodType)}</Text>
            </View>
          ) : null}
        </View>

        {/* Allergies — the single most important field for a first responder */}
        <View style={[styles.section, styles.allergyBox]}>
          <Text style={styles.allergyLabel}>{t.emergency.allergies.toUpperCase()}</Text>
          {lovedOne.allergies?.length ? (
            lovedOne.allergies.map((a) => (
              <View key={a} style={styles.allergyRow}>
                <Icon name="alert-triangle" size={22} color={colors.urgent} strokeWidth={2.4} />
                <Text style={styles.allergyItem}>{a}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.none}>{t.emergency.noneRecorded}</Text>
          )}
        </View>

        {lovedOne.conditions?.length ? (
          <Block title={t.emergency.conditions}>
            {lovedOne.conditions.map((c) => (
              <Text key={c} style={styles.item}>
                • {c}
              </Text>
            ))}
          </Block>
        ) : null}

        <Block title={t.emergency.currentMeds}>
          {medications.length ? (
            medications.map((m) => (
              <Text key={m.id} style={styles.item}>
                • {m.name} — {m.dosage}
                {m.critical ? <Text style={styles.critical}>{`  ${t.emergency.critical}`}</Text> : null}
              </Text>
            ))
          ) : (
            <Text style={styles.none}>{t.emergency.noneRecorded}</Text>
          )}
        </Block>

        {lovedOne.emergencyContacts?.length ? (
          <Block title={t.emergency.emergencyContacts}>
            {lovedOne.emergencyContacts.map((c) => (
              <Pressable key={c.phone} style={styles.contact} onPress={() => call(c.phone)}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.contactName}>{c.name}</Text>
                  <Text style={styles.contactRel}>{c.relationship}</Text>
                </View>
                <View style={styles.callBtn}>
                  <Icon name="phone" size={18} color="#fff" strokeWidth={2.2} />
                  <Text style={styles.callBtnText}>{t.emergency.call}</Text>
                </View>
              </Pressable>
            ))}
          </Block>
        ) : null}

        {lovedOne.doctor || lovedOne.pharmacy ? (
          <Block title={t.emergency.careTeam}>
            {lovedOne.doctor ? (
              <View style={styles.teamRow}>
                <Icon name="stethoscope" size={20} color={colors.accentInk} strokeWidth={2} />
                <Text style={styles.item}>{lovedOne.doctor}</Text>
              </View>
            ) : null}
            {lovedOne.pharmacy ? (
              <View style={styles.teamRow}>
                <Icon name="pill" size={20} color={colors.accentInk} strokeWidth={2} />
                <Text style={styles.item}>{lovedOne.pharmacy}</Text>
              </View>
            ) : null}
          </Block>
        ) : null}

        {lovedOne.medicalNotes ? (
          <Block title={t.emergency.notes}>
            <Text style={styles.item}>{lovedOne.medicalNotes}</Text>
          </Block>
        ) : null}

        <Pressable style={styles.shareBtn} onPress={onShare}>
          <Text style={styles.shareText}>{t.emergency.shareCard}</Text>
        </Pressable>
        <Pressable style={styles.closeBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.closeText}>{t.common.close}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{title.toUpperCase()}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  scroll: { padding: space.lg },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xl },
  emptyText: { fontSize: type.bodyLg, color: colors.inkSoft, textAlign: 'center' },

  header: { marginBottom: space.lg },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  badge: { fontFamily: font.bodyBold, fontSize: type.caption, color: colors.urgent, letterSpacing: 1.3 },
  name: { fontFamily: font.display, fontSize: type.seniorTitle, color: colors.ink, marginTop: space.xs },
  age: { fontFamily: font.body, fontSize: type.title, color: colors.inkSoft },
  bloodChip: {
    alignSelf: 'flex-start',
    marginTop: space.sm,
    backgroundColor: colors.urgentSoft,
    borderRadius: radius.pill,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
  },
  bloodText: { color: colors.urgent, fontWeight: '800', fontSize: type.body },

  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: space.lg,
    marginBottom: space.md,
  },
  sectionLabel: { fontFamily: font.bodyBold, fontSize: type.caption, letterSpacing: 1.1, color: colors.inkFaint, marginBottom: space.sm },
  item: { fontSize: type.bodyLg, color: colors.ink, marginTop: 4, lineHeight: type.bodyLg * 1.3 },
  teamRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: 4 },
  none: { fontSize: type.body, color: colors.inkFaint },
  critical: { color: colors.urgent, fontFamily: font.bodyBold, fontSize: type.caption },

  allergyBox: { backgroundColor: colors.urgentSoft, borderColor: colors.urgent, borderWidth: 2 },
  allergyLabel: { fontFamily: font.bodyBold, fontSize: type.caption, letterSpacing: 1.1, color: colors.urgentInk, marginBottom: space.sm },
  allergyRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: space.xs },
  allergyItem: { fontFamily: font.headingBold, fontSize: type.title, color: colors.ink },

  contact: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: space.sm,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  contactName: { fontFamily: font.headingMed, fontSize: type.bodyLg, color: colors.ink },
  contactRel: { fontFamily: font.body, fontSize: type.caption, color: colors.inkSoft },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.calm,
    borderRadius: radius.pill,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
  },
  callBtnText: { color: '#fff', fontFamily: font.bodyBold, fontSize: type.body },

  shareBtn: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    padding: space.md,
    alignItems: 'center',
    marginTop: space.md,
  },
  shareText: { color: colors.onAccent, fontWeight: '800', fontSize: type.bodyLg },
  closeBtn: { padding: space.md, alignItems: 'center', marginTop: space.xs },
  closeText: { color: colors.inkSoft, fontWeight: '600', fontSize: type.body },
});
