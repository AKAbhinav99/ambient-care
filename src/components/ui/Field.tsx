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
  multiline?: boolean; // grows for longer freeform text (e.g. clinical notes)
}

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  autoCapitalize = 'sentences',
  keyboardType,
  secure,
  multiline,
}: FieldProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.inkFaint}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        secureTextEntry={secure}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        textAlignVertical={multiline ? 'top' : 'center'}
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
  inputMultiline: { minHeight: 96, paddingTop: space.sm + 3 },
});
