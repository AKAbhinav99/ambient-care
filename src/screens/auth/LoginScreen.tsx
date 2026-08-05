import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../../lib/store';
import { isSupabaseConfigured } from '../../lib/supabase';
import { signIn } from '../../lib/auth';
import { Card } from '../../components/ui/Card';
import { BigButton } from '../../components/ui/BigButton';
import { Field } from '../../components/ui/Field';
import { Icon } from '../../components/ui/Icon';
import { colors, space, type, radius, font } from '../../theme/tokens';
import type { AuthProps } from '../../navigation/types';

export function LoginScreen({ navigation }: AuthProps<'Login'>) {
  const setAccount = useStore((s) => s.setAccount);
  const seedDemo = useStore((s) => s.seedDemo);
  const roster = useStore((s) => s.roster);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onLogIn = async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    setBusy(true);
    const res = await signIn(email, password);
    setBusy(false);
    if (res.ok && res.account) setAccount(res.account);
    else setError(res.error === 'not-configured' ? 'Backend not connected yet.' : res.error ?? 'Sign-in failed.');
  };

  const exploreLocalDemo = () => {
    if (roster.length === 0) seedDemo();
    setAccount({ id: 'local', name: 'You', email: '', local: true });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.brandRow}>
          <View style={styles.logo}>
            <Icon name="activity" size={20} color={colors.onAccent} strokeWidth={2.4} />
          </View>
          <Text style={styles.brand}>Ambient Care</Text>
        </View>

        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.sub}>Sign in to look after the people in your care.</Text>

        {!isSupabaseConfigured ? (
          <Card style={styles.notice}>
            <Text style={styles.noticeTitle}>Connect your backend to sign in</Text>
            <Text style={styles.noticeText}>
              Cloud accounts need a Supabase project. Create one, run supabase/schema.sql, and add
              EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to a .env file, then restart
              with{' '}expo{' '}start{' '}-c.
            </Text>
            <BigButton
              icon="user"
              label="Explore a local demo"
              sublabel="Try it on this device without an account"
              variant="accent"
              onPress={exploreLocalDemo}
              style={{ marginTop: space.md }}
            />
          </Card>
        ) : (
          <Card style={{ marginTop: space.lg }}>
            <Field label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" autoCapitalize="none" keyboardType="email-address" />
            <Field label="Password" value={password} onChangeText={setPassword} placeholder="••••••••" autoCapitalize="none" secure />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <BigButton
              icon={busy ? undefined : 'check'}
              label={busy ? 'Signing in…' : 'Log in'}
              variant="accent"
              disabled={busy}
              onPress={onLogIn}
              style={{ marginTop: space.sm }}
            />
            {busy ? <ActivityIndicator color={colors.accent} style={{ marginTop: space.sm }} /> : null}
          </Card>
        )}

        <Pressable onPress={() => navigation.navigate('SignUp')} style={styles.switchLink} hitSlop={8}>
          <Text style={styles.switchText}>
            New here? <Text style={styles.switchStrong}>Create an account</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  scroll: { padding: space.lg, flexGrow: 1, justifyContent: 'center' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginBottom: space.xl },
  logo: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: { fontFamily: font.headingBold, fontSize: type.bodyLg, color: colors.accentInk, letterSpacing: 0.2 },
  title: { fontFamily: font.display, fontSize: type.headline, color: colors.ink },
  sub: { fontFamily: font.body, fontSize: type.bodyLg, color: colors.inkSoft, marginTop: space.xs, lineHeight: type.bodyLg * 1.35 },
  notice: { marginTop: space.lg, backgroundColor: colors.surfaceSunken },
  noticeTitle: { fontFamily: font.headingBold, fontSize: type.bodyLg, color: colors.ink },
  noticeText: { fontFamily: font.body, fontSize: type.body, color: colors.inkSoft, marginTop: space.xs, lineHeight: type.body * 1.45 },
  error: { color: colors.urgent, fontFamily: font.bodyMed, fontSize: type.body, marginTop: space.sm },
  switchLink: { marginTop: space.xl, alignItems: 'center', padding: space.md },
  switchText: { color: colors.inkSoft, fontSize: type.body },
  switchStrong: { color: colors.accentInk, fontFamily: font.bodyBold },
});
