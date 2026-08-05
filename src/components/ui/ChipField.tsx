/**
 * A labeled single-select chip row — for short, closed-vocabulary fields (blood
 * type, etc.) where free text invites typos and inconsistent values. Tapping the
 * active chip again clears the selection (the field stays optional).
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, radius, space, type, font } from '../../theme/tokens';

interface ChipFieldProps {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
}

export function ChipField({ label, options, value, onChange }: ChipFieldProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        {options.map((opt) => {
          const active = value === opt;
          return (
            <Pressable
              key={opt}
              onPress={() => onChange(active ? '' : opt)}
              style={[styles.chip, active && styles.chipOn]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.chipText, active && styles.chipTextOn]}>{opt}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: space.md },
  label: { fontFamily: font.bodyMed, fontSize: type.caption, color: colors.inkSoft, marginBottom: space.xs },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs },
  chip: {
    minWidth: 52,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: space.xs + 2,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    backgroundColor: colors.surface,
  },
  chipOn: { borderColor: colors.accent, backgroundColor: colors.accent },
  chipText: { fontFamily: font.bodyMed, fontSize: type.body, color: colors.ink },
  chipTextOn: { color: colors.onAccent },
});
