/**
 * A labeled date-of-birth picker matching the Field visual language, backed by
 * the native date picker (no free-text date entry — avoids unparseable/garbage
 * dates and the "what format?" guesswork the old placeholder-only field had).
 *
 * iOS has no self-dismissing inline picker, so it opens in a small sheet with
 * Cancel/Done; Android's native dialog opens and closes itself, so the picker is
 * only mounted while `open` is true and applies on the 'set' event.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, Platform } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { colors, radius, space, type, font } from '../../theme/tokens';
import { Icon } from './Icon';

interface DateFieldProps {
  label: string;
  value: string; // ISO "YYYY-MM-DD", or '' when unset
  onChange: (iso: string) => void;
  placeholder?: string;
}

const DEFAULT_YEARS_AGO = 75; // a sensible starting point for an elderly-care app

function toIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseIso(value: string): Date | null {
  if (!value.trim()) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatDisplay(value: string): string | null {
  const d = parseIso(value);
  return d ? d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : null;
}

function defaultPickerDate(value: string): Date {
  return parseIso(value) ?? new Date(new Date().getFullYear() - DEFAULT_YEARS_AGO, 0, 1);
}

export function DateField({ label, value, onChange, placeholder = 'Select date' }: DateFieldProps) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<Date>(() => defaultPickerDate(value));

  const openPicker = () => {
    setPending(defaultPickerDate(value));
    setOpen(true);
  };

  const onAndroidChange = (event: DateTimePickerEvent, date?: Date) => {
    setOpen(false);
    if (event.type === 'set' && date) onChange(toIso(date));
  };

  const confirmIOS = () => {
    onChange(toIso(pending));
    setOpen(false);
  };

  const display = formatDisplay(value);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={styles.input} onPress={openPicker} accessibilityRole="button" accessibilityLabel={display ?? placeholder}>
        <Text style={display ? styles.value : styles.placeholder}>{display ?? placeholder}</Text>
        <Icon name="calendar" size={20} color={colors.inkFaint} strokeWidth={2} />
      </Pressable>

      {open && Platform.OS === 'android' ? (
        <DateTimePicker value={pending} mode="date" display="default" maximumDate={new Date()} onChange={onAndroidChange} />
      ) : null}

      {open && Platform.OS === 'ios' ? (
        <Modal transparent animationType="fade" visible={open} onRequestClose={() => setOpen(false)}>
          <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
            <Pressable style={styles.sheet} onPress={() => {}}>
              <Text style={styles.sheetTitle}>{label}</Text>
              <DateTimePicker
                value={pending}
                mode="date"
                display="spinner"
                maximumDate={new Date()}
                onChange={(_, date) => date && setPending(date)}
                style={styles.picker}
              />
              <View style={styles.sheetActions}>
                <Pressable style={styles.cancelBtn} onPress={() => setOpen(false)} hitSlop={8}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
                <Pressable style={styles.doneBtn} onPress={confirmIOS} hitSlop={8}>
                  <Text style={styles.doneText}>Done</Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: space.md },
  label: { fontFamily: font.bodyMed, fontSize: type.caption, color: colors.inkSoft, marginBottom: space.xs },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceSunken,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    paddingHorizontal: space.md,
    paddingVertical: space.sm + 3,
    minHeight: 48,
  },
  value: { fontFamily: font.body, fontSize: type.body, color: colors.ink },
  placeholder: { fontFamily: font.body, fontSize: type.body, color: colors.inkFaint },

  backdrop: { flex: 1, backgroundColor: 'rgba(15,23,30,0.4)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingTop: space.lg,
    paddingBottom: space.xl,
    paddingHorizontal: space.lg,
  },
  sheetTitle: {
    fontFamily: font.headingBold,
    fontSize: type.bodyLg,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: space.sm,
  },
  picker: { alignSelf: 'center' },
  sheetActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: space.md },
  cancelBtn: { paddingVertical: space.sm, paddingHorizontal: space.lg },
  cancelText: { fontFamily: font.bodyMed, fontSize: type.bodyLg, color: colors.inkSoft },
  doneBtn: {
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingVertical: space.sm,
    paddingHorizontal: space.xl,
  },
  doneText: { fontFamily: font.bodyBold, fontSize: type.bodyLg, color: colors.onAccent },
});
