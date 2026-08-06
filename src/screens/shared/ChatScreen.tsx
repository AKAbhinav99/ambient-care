/**
 * The chat thread between the caregiver and the recipient's home device — one
 * shared, role-aware component (same approach as EmergencyCardScreen), registered
 * in both navigators. The senior side stays in this app's accessibility language:
 * larger type and a row of quick-reply chips above the input to cut down on typing.
 *
 * Sync is polling, not a Realtime subscription (see lib/supabase.ts) — one sync on
 * focus catches anything sent while the screen was closed, then a light interval
 * while the screen stays open keeps a live conversation feeling responsive without
 * relying on Realtime's row-level-security behavior for the unauthenticated home
 * device.
 */

import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useStore } from '../../lib/store';
import { useT } from '../../i18n';
import { Icon } from '../../components/ui/Icon';
import { colors, space, type, radius, font } from '../../theme/tokens';
import type { ChatMessage } from '../../types';

const POLL_MS = 4000;

export function ChatScreen() {
  const role = useStore((s) => s.role);
  const lovedOne = useStore((s) => s.lovedOne);
  const messages = useStore((s) => s.messages);
  const sendMessage = useStore((s) => s.sendMessage);
  const markSeen = useStore((s) => s.markSeen);
  const syncMessages = useStore((s) => s.syncMessages);
  const { t } = useT();
  const isSenior = role === 'senior';

  const [draft, setDraft] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  // Mark the thread read + do one sync as soon as the screen opens, then keep a
  // light poll running while it stays focused (cleared on blur/unmount).
  useFocusEffect(
    useCallback(() => {
      markSeen(isSenior ? 'senior' : 'caregiver');
      syncMessages();
      const id = setInterval(syncMessages, POLL_MS);
      return () => clearInterval(id);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSenior]),
  );

  const send = (body: string) => {
    if (!body.trim()) return;
    sendMessage(body);
    setDraft('');
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scroll}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {messages.length === 0 ? (
            <View style={styles.empty}>
              <Icon name="message" size={isSenior ? 40 : 32} color={colors.inkFaint} strokeWidth={1.8} />
              <Text style={[styles.emptyTitle, isSenior && styles.emptyTitleXl]}>{t.chat.emptyTitle}</Text>
              <Text style={[styles.emptyBody, isSenior && styles.emptyBodyXl]}>{t.chat.emptyBody}</Text>
            </View>
          ) : (
            messages.map((m) => <Bubble key={m.id} message={m} mine={m.sender === (isSenior ? 'senior' : 'caregiver')} isSenior={isSenior} />)
          )}
        </ScrollView>

        {isSenior ? (
          <View style={styles.quickRow}>
            <QuickChip label={t.chat.quickLoveToo} onPress={() => send(t.chat.quickLoveToo)} />
            <QuickChip label={t.chat.quickOkay} onPress={() => send(t.chat.quickOkay)} />
            <QuickChip label={t.chat.quickCallMe} onPress={() => send(t.chat.quickCallMe)} />
          </View>
        ) : null}

        <View style={[styles.inputRow, isSenior && styles.inputRowXl]}>
          <TextInput
            style={[styles.input, isSenior && styles.inputXl]}
            value={draft}
            onChangeText={setDraft}
            placeholder={t.chat.placeholder}
            placeholderTextColor={colors.inkFaint}
            multiline
            onSubmitEditing={() => send(draft)}
          />
          <Pressable
            style={[styles.send, isSenior && styles.sendXl, !draft.trim() && styles.sendDisabled]}
            onPress={() => send(draft)}
            disabled={!draft.trim()}
            accessibilityRole="button"
            accessibilityLabel={t.chat.send}
          >
            <Icon name="send" size={isSenior ? 24 : 20} color={colors.onAccent} strokeWidth={2.2} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Bubble({ message, mine, isSenior }: { message: ChatMessage; mine: boolean; isSenior: boolean }) {
  return (
    <View style={[styles.bubbleRow, mine && styles.bubbleRowMine]}>
      <View
        style={[
          styles.bubble,
          isSenior && styles.bubbleXl,
          mine ? styles.bubbleMine : styles.bubbleTheirs,
        ]}
      >
        <Text
          style={[
            styles.bubbleText,
            isSenior && styles.bubbleTextXl,
            mine ? styles.bubbleTextMine : styles.bubbleTextTheirs,
          ]}
        >
          {message.body}
        </Text>
      </View>
    </View>
  );
}

function QuickChip({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.chip} onPress={onPress} accessibilityRole="button">
      <Text style={styles.chipText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  scroll: { padding: space.lg, flexGrow: 1, justifyContent: 'flex-end' },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.sm, paddingVertical: space.xl },
  emptyTitle: { fontFamily: font.headingBold, fontSize: type.bodyLg, color: colors.inkSoft, textAlign: 'center' },
  emptyTitleXl: { fontSize: type.seniorBody },
  emptyBody: { fontFamily: font.body, fontSize: type.body, color: colors.inkFaint, textAlign: 'center' },
  emptyBodyXl: { fontSize: type.body, color: colors.inkFaint },

  bubbleRow: { flexDirection: 'row', marginTop: space.sm },
  bubbleRowMine: { justifyContent: 'flex-end' },
  bubble: {
    maxWidth: '80%',
    borderRadius: radius.lg,
    paddingVertical: space.sm + 2,
    paddingHorizontal: space.md,
  },
  bubbleXl: { maxWidth: '88%', paddingVertical: space.md, paddingHorizontal: space.lg, borderRadius: radius.lg },
  bubbleMine: { backgroundColor: colors.accent, borderBottomRightRadius: radius.sm },
  bubbleTheirs: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderBottomLeftRadius: radius.sm },
  bubbleText: { fontFamily: font.body, fontSize: type.body, lineHeight: type.body * 1.35 },
  bubbleTextXl: { fontSize: type.seniorBody, lineHeight: type.seniorBody * 1.35 },
  bubbleTextMine: { color: colors.onAccent },
  bubbleTextTheirs: { color: colors.ink },

  quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, paddingHorizontal: space.lg, paddingBottom: space.sm },
  chip: {
    backgroundColor: colors.accentSoft,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.accent,
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
  },
  chipText: { fontFamily: font.bodyBold, fontSize: type.body, color: colors.accentInk },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: space.sm,
    padding: space.lg,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.paper,
  },
  inputRowXl: { paddingVertical: space.lg },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: space.md,
    paddingVertical: space.sm + 2,
    fontFamily: font.body,
    fontSize: type.body,
    color: colors.ink,
    maxHeight: 120,
  },
  inputXl: { fontSize: type.seniorBody, minHeight: 56, paddingVertical: space.sm + 4 },
  send: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendXl: { width: 60, height: 60 },
  sendDisabled: { opacity: 0.4 },
});
