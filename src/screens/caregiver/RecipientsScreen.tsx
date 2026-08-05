import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Share, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../../lib/store';
import { Card } from '../../components/ui/Card';
import { BigButton } from '../../components/ui/BigButton';
import { Icon } from '../../components/ui/Icon';
import { colors, space, type, radius, font } from '../../theme/tokens';
import type { CaregiverProps } from '../../navigation/types';
import type { LovedOne } from '../../types';

export function RecipientsScreen({ navigation }: CaregiverProps<'Recipients'>) {
  const roster = useStore((s) => s.roster);
  const account = useStore((s) => s.account);
  const setActiveRecipient = useStore((s) => s.setActiveRecipient);
  const signOutAccount = useStore((s) => s.signOutAccount);

  const open = (id: string) => {
    setActiveRecipient(id);
    navigation.navigate('CaregiverHome');
  };

  const confirmLogout = () =>
    Alert.alert('Log out?', 'You can sign back in anytime.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: signOutAccount },
    ]);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.head}>
          <View style={{ flex: 1 }}>
            <Text style={styles.hello}>Hi{account?.name ? `, ${account.name.split(' ')[0]}` : ''}</Text>
            <Text style={styles.title}>Who you're caring for</Text>
          </View>
          <Pressable onPress={confirmLogout} hitSlop={10} style={styles.logout}>
            <Text style={styles.logoutText}>Log out</Text>
          </Pressable>
        </View>

        {roster.length === 0 ? (
          <Card style={styles.empty}>
            <Text style={styles.emptyTitle}>Add your first person</Text>
            <Text style={styles.emptyText}>
              Set up a profile for someone you care for. You'll get a code to enter on their home
              device to connect it.
            </Text>
          </Card>
        ) : (
          roster.map((r) => <RecipientRow key={r.id} recipient={r} onOpen={() => open(r.id)} />)
        )}

        <BigButton
          icon="plus"
          label="Add a care recipient"
          variant="accent"
          onPress={() => navigation.navigate('AddRecipient')}
          style={{ marginTop: space.lg }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function RecipientRow({ recipient, onOpen }: { recipient: LovedOne; onOpen: () => void }) {
  const shareCode = () =>
    Share.share({
      message: `Connect ${recipient.name}'s Ambient Care home device with this code: ${recipient.pairingCode}`,
    }).catch(() => {});

  return (
    <Pressable onPress={onOpen} style={styles.rowWrap} accessibilityRole="button">
      <Card style={styles.row}>
        <View style={styles.avatar}>
          <Icon name="user" size={22} color={colors.accentInk} strokeWidth={2} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name} numberOfLines={1}>
            {recipient.name}
          </Text>
          <Text style={styles.rel} numberOfLines={1}>
            {recipient.relationship}
            {recipient.paired ? ' · connected' : ' · not connected'}
          </Text>
          <Pressable onPress={shareCode} hitSlop={8} style={styles.codeChip}>
            <Text style={styles.codeLabel}>CODE</Text>
            <Text style={styles.code}>{recipient.pairingCode}</Text>
            <Icon name="link" size={14} color={colors.accentInk} strokeWidth={2.2} />
          </Pressable>
        </View>
        <Icon name="chevron-right" size={22} color={colors.inkFaint} />
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  scroll: { padding: space.lg },
  head: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: space.lg },
  hello: { fontFamily: font.body, fontSize: type.body, color: colors.inkSoft },
  title: { fontFamily: font.display, fontSize: type.headline, color: colors.ink, letterSpacing: -0.4 },
  logout: { paddingVertical: space.xs, paddingHorizontal: space.sm },
  logoutText: { color: colors.inkFaint, fontFamily: font.bodyBold, fontSize: type.body },

  empty: { backgroundColor: colors.surfaceSunken },
  emptyTitle: { fontFamily: font.headingBold, fontSize: type.bodyLg, color: colors.ink },
  emptyText: { fontFamily: font.body, fontSize: type.body, color: colors.inkSoft, marginTop: space.xs, lineHeight: type.body * 1.45 },

  rowWrap: { marginBottom: space.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontFamily: font.headingBold, fontSize: type.bodyLg, color: colors.ink },
  rel: { fontFamily: font.body, fontSize: type.caption, color: colors.inkSoft, marginTop: 1 },
  codeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginTop: space.sm,
    backgroundColor: colors.accentSoft,
    borderRadius: radius.pill,
    paddingHorizontal: space.sm,
    paddingVertical: 3,
  },
  codeLabel: { fontFamily: font.bodyBold, fontSize: 10, letterSpacing: 1, color: colors.accentInk },
  code: { fontFamily: font.headingBold, fontSize: type.body, letterSpacing: 2, color: colors.accentInk },
});
