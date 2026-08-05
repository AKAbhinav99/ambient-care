import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../../lib/store';
import { useT } from '../../i18n';
import { Icon } from '../../components/ui/Icon';
import { colors, space, type, radius, font } from '../../theme/tokens';

/**
 * The home (senior) device's front door: no account, just a join code. On a valid
 * code the store binds this device to that recipient (local roster first, then the
 * cloud redeem_code RPC) and the senior surface takes over.
 */
export function CodeEntryScreen() {
  const bindByCode = useStore((s) => s.bindByCode);
  const signOut = useStore((s) => s.signOut);
  const { t } = useT();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  const connect = async () => {
    if (!code.trim() || busy) return;
    setError(false);
    setBusy(true);
    const ok = await bindByCode(code);
    setBusy(false);
    if (!ok) setError(true);
    // On success the store flips to the senior surface; nothing more to do here.
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.iconWell}>
          <Icon name="link" size={34} color={colors.accentInk} strokeWidth={2.2} />
        </View>
        <Text style={styles.title}>{t.codeEntry.title}</Text>
        <Text style={styles.sub}>{t.codeEntry.sub}</Text>

        <TextInput
          style={styles.input}
          value={code}
          onChangeText={(v) => {
            setCode(v.toUpperCase());
            if (error) setError(false);
          }}
          placeholder={t.codeEntry.placeholder}
          placeholderTextColor={colors.inkFaint}
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={8}
          returnKeyType="done"
          onSubmitEditing={connect}
        />

        {error ? <Text style={styles.error}>{t.codeEntry.invalid}</Text> : null}

        <Pressable
          style={[styles.connect, (!code.trim() || busy) && styles.connectDisabled]}
          onPress={connect}
          disabled={!code.trim() || busy}
          accessibilityRole="button"
        >
          {busy ? (
            <ActivityIndicator color={colors.onAccent} />
          ) : (
            <Text style={styles.connectText}>{t.codeEntry.connect}</Text>
          )}
        </Pressable>

        <Pressable onPress={signOut} style={styles.back} hitSlop={10}>
          <Text style={styles.backText}>{t.codeEntry.back}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  scroll: { padding: space.lg, flexGrow: 1, justifyContent: 'center' },
  iconWell: {
    width: 72,
    height: 72,
    borderRadius: radius.lg,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: space.lg,
  },
  title: { fontFamily: font.display, fontSize: type.seniorTitle, color: colors.ink, textAlign: 'center' },
  sub: {
    fontFamily: font.body,
    fontSize: type.seniorBody,
    color: colors.inkSoft,
    textAlign: 'center',
    marginTop: space.sm,
    lineHeight: type.seniorBody * 1.35,
  },
  input: {
    marginTop: space.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.lineStrong,
    paddingVertical: space.lg,
    textAlign: 'center',
    fontFamily: font.display,
    fontSize: 44,
    letterSpacing: 8,
    color: colors.accentInk,
  },
  error: { color: colors.urgent, fontFamily: font.bodyMed, fontSize: type.body, textAlign: 'center', marginTop: space.md },
  connect: {
    marginTop: space.lg,
    backgroundColor: colors.accent,
    borderRadius: radius.lg,
    paddingVertical: space.lg,
    alignItems: 'center',
    minHeight: 64,
    justifyContent: 'center',
  },
  connectDisabled: { opacity: 0.45 },
  connectText: { color: colors.onAccent, fontFamily: font.headingBold, fontSize: type.title },
  back: { marginTop: space.lg, alignItems: 'center', padding: space.md },
  backText: { color: colors.inkFaint, fontFamily: font.bodyMed, fontSize: type.body },
});
