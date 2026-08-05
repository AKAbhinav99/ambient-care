import React from 'react';
import { View, Text, TextInput, StyleSheet, type KeyboardTypeOptions } from 'react-native';
import { colors, radius, space, type, font } from '../../theme/tokens';

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  autoCapitalize?: 'none' | 'words' | 'sentences' | 'characters';
  keyboardType?: KeyboardTypeOptions;
  secure?: boolean; // password entry (masks input)
}

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  autoCapitalize = 'sentences',
  keyboardType,
  secure,
}: FieldProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.inkFaint}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        secureTextEntry={secure}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: space.md },
  label: {
    fontFamily: font.bodyMed,
    fontSize: type.caption,
    color: colors.inkSoft,
    marginBottom: space.xs,
  },
  input: {
    backgroundColor: colors.surfaceSunken,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    paddingHorizontal: space.md,
    paddingVertical: space.sm + 3,
    minHeight: 48,
    fontFamily: font.body,
    fontSize: type.body,
    color: colors.ink,
  },
});
