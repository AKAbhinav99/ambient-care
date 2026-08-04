import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useStore } from '../lib/store';
import { dueDoses } from '../lib/adherence';
import { say } from '../lib/speech';
import { colors, radius, space, type, font } from '../theme/tokens';
import { Icon } from './ui/Icon';

/**
 * Senior-facing "Time for your pills" prompt. Renders only when a dose window is
 * open. `now` is passed from SeniorHome's clock tick so it refreshes on its own.
 */
export function DosePrompt({ now }: { now: number }) {
  const medications = useStore((s) => s.medications);
  const doseLogs = useStore((s) => s.doseLogs);
  const markDoseTaken = useStore((s) => s.markDoseTaken);
  const markDoseSkipped = useStore((s) => s.markDoseSkipped);

  const due = dueDoses(medications, doseLogs, now);
  if (!due.length) return null;

  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <Icon name="pill" size={22} color={colors.accentInk} strokeWidth={2.2} />
        <Text style={styles.title}>Time for your medicine</Text>
      </View>
      {due.map((slot) => (
        <View key={`${slot.med.id}-${slot.scheduledAt}`} style={styles.doseRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.medName}>{slot.med.friendlyName}</Text>
            <Text style={styles.medDose}>{slot.med.dosage}</Text>
          </View>
          <View style={styles.doseActions}>
            <Pressable
              style={styles.takeBtn}
              accessibilityRole="button"
              accessibilityLabel={`Mark ${slot.med.friendlyName} as taken`}
              onPress={() => {
                markDoseTaken(slot.med.id, slot.scheduledAt, 'manual');
                say(`Good. I've marked ${slot.med.friendlyName} as taken.`);
              }}
            >
              <Icon name="check" size={20} color={colors.onAccent} strokeWidth={2.6} />
              <Text style={styles.takeBtnText}>I took it</Text>
            </Pressable>
            <Pressable
              style={styles.skipBtn}
              onPress={() => markDoseSkipped(slot.med.id, slot.scheduledAt)}
              hitSlop={8}
            >
              <Text style={styles.skipText}>Not now</Text>
            </Pressable>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.accentSoft,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.accent,
    padding: space.lg,
    marginBottom: space.lg,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginBottom: space.md },
  title: { fontFamily: font.displaySemi, fontSize: type.seniorBody, color: colors.accentInk },
  doseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingVertical: space.sm,
    borderTopWidth: 1,
    borderTopColor: colors.accent,
  },
  medName: { fontFamily: font.headingMed, fontSize: type.seniorBody, color: colors.ink },
  medDose: { fontFamily: font.body, fontSize: type.body, color: colors.inkSoft, marginTop: 2 },
  doseActions: { alignItems: 'flex-end', gap: space.xs },
  takeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingVertical: space.sm,
    paddingHorizontal: space.lg,
  },
  takeBtnText: { color: colors.onAccent, fontFamily: font.bodyBold, fontSize: type.bodyLg },
  skipBtn: { paddingVertical: 2, paddingHorizontal: space.sm },
  skipText: { color: colors.inkSoft, fontFamily: font.bodyMed, fontSize: type.caption },
});
