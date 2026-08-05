import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../../lib/store';
import { isSupabaseConfigured } from '../../lib/supabase';
import { signUp } from '../../lib/auth';
import { Card } from '../../components/ui/Card';
import { BigButton } from '../../components/ui/BigButton';
import { Field } from '../../components/ui/Field';
import { colors, space, type, font } from '../../theme/tokens';
import type { AuthProps } from '../../navigation/types';

const MIN_PASSWORD = 6;

export function SignUpScreen({ navigation }: AuthProps<'SignUp'>) {
  const setAccount = useStore((s) => s.setAccount);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const validate = (): string | null => {
    if (!name.trim()) return 'Please enter your name.';
    if (!email.trim() || !email.includes('@')) return 'Please enter a valid email.';
    if (password.length < MIN_PASSWORD) return `Password must be at least ${MIN_PASSWORD} characters.`;
    if (password !== confirm) return "Passwords don't match.";
    return null;
  };

  const onCreate = async () => {
    setError(null);
    setNotice(null);
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    if (!isSupabaseConfigured) {
      setError('Backend not connected — see the note on the sign-in screen.');
      return;
    }
    setBusy(true);
    const res = await signUp(name, email, password);
    setBusy(false);
    if (res.ok && res.account) {
      setAccount(res.account);
    } else if (res.ok && res.needsConfirmation) {
      setNotice('Account created. Check your email to confirm, then log in.');
    } else {
      setError(res.error ?? 'Could not create the account.');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.sub}>You'll add the people you care for next — each gets their own code.</Text>

        <Card style={{ marginTop: space.lg }}>
          <Field label="Your name" value={name} onChangeText={setName} placeholder="Alex Rivera" autoCapitalize="words" />
          <Field label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" autoCapitalize="none" keyboardType="email-address" />
          <Field label="Password" value={password} onChangeText={setPassword} placeholder="At least 6 characters" autoCapitalize="none" secure />
          <Field label="Confirm password" value={confirm} onChangeText={setConfirm} placeholder="Re-enter password" autoCapitalize="none" secure />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {notice ? <Text style={styles.notice}>{notice}</Text> : null}
          <BigButton
            icon={busy ? undefined : 'check'}
            label={busy ? 'Creating…' : 'Create account'}
            variant="accent"
            disabled={busy}
            onPress={onCreate}
            style={{ marginTop: space.sm }}
          />
          {busy ? <ActivityIndicator color={colors.accent} style={{ marginTop: space.sm }} /> : null}
        </Card>

        <Pressable onPress={() => navigation.navigate('Login')} style={styles.switchLink} hitSlop={8}>
          <Text style={styles.switchText}>
            Already have an account? <Text style={styles.switchStrong}>Log in</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  scroll: { padding: space.lg, flexGrow: 1, justifyContent: 'center' },
  title: { fontFamily: font.display, fontSize: type.headline, color: colors.ink },
  sub: { fontFamily: font.body, fontSize: type.bodyLg, color: colors.inkSoft, marginTop: space.xs, lineHeight: type.bodyLg * 1.35 },
  error: { color: colors.urgent, fontFamily: font.bodyMed, fontSize: type.body, marginTop: space.sm },
  notice: { color: colors.accentInk, fontFamily: font.bodyMed, fontSize: type.body, marginTop: space.sm, lineHeight: type.body * 1.4 },
  switchLink: { marginTop: space.xl, alignItems: 'center', padding: space.md },
  switchText: { color: colors.inkSoft, fontSize: type.body },
  switchStrong: { color: colors.accentInk, fontFamily: font.bodyBold },
});
