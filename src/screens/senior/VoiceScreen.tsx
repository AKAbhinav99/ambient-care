import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../../lib/store';
import { useT, type Messages } from '../../i18n';
import { say } from '../../lib/speech';
import { fireAlert } from '../../lib/notifications';
import { matchIntent, type IntentId } from '../../lib/intents';
import { todaysDoses } from '../../lib/adherence';
import { Icon, type IconName } from '../../components/ui/Icon';
import { colors, space, type, radius, shadow, font } from '../../theme/tokens';
import type { DoseLog, Medication } from '../../types';
import type { SeniorProps } from '../../navigation/types';

export function VoiceScreen(_: SeniorProps<'Voice'>) {
  const lovedOne = useStore((s) => s.lovedOne);
  const medications = useStore((s) => s.medications);
  const doseLogs = useStore((s) => s.doseLogs);
  const logEvent = useStore((s) => s.logEvent);
  const { t } = useT();

  const [reply, setReply] = useState<string>(t.talk.intro);
  const [typed, setTyped] = useState('');

  // The relationship the caregiver entered (e.g. "Mother"), used both in the UI
  // and spoken back. Event titles below stay English for the caregiver's log.
  const family = lovedOne?.relationship ?? 'family';

  const respond = (text: string) => {
    setReply(text);
    say(text);
  };

  const handleIntent = (intent: IntentId) => {
    switch (intent) {
      case 'distress': {
        const ev = logEvent({
          kind: 'voice_distress',
          severity: 'urgent',
          title: `${firstName(lovedOne?.name)} said they don't feel well`,
          detail: 'Spoken distress phrase — reach out now.',
        });
        if (lovedOne) fireAlert(ev, firstName(lovedOne.name));
        respond(t.spoken.distress(family));
        break;
      }
      case 'callFamily': {
        logEvent({
          kind: 'voice_call',
          severity: 'checkIn',
          title: `${firstName(lovedOne?.name)} asked to call ${family}`,
        });
        respond(t.spoken.calling(family));
        break;
      }
      case 'meds': {
        logEvent({
          kind: 'voice_meds',
          severity: 'info',
          title: `${firstName(lovedOne?.name)} asked about their medicine`,
        });
        respond(medsSentence(medications, t));
        break;
      }
      case 'checkMeds': {
        logEvent({
          kind: 'voice_meds',
          severity: 'info',
          title: `${firstName(lovedOne?.name)} asked if they'd taken their medicine`,
        });
        respond(takenAnswer(medications, doseLogs, Date.now(), t));
        break;
      }
      default:
        respond(smalltalk(t));
    }
  };

  const onType = () => {
    if (!typed.trim()) return;
    handleIntent(matchIntent(typed));
    setTyped('');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* The assistant's reply, big and warm */}
        <View style={styles.replyCard}>
          <Text style={styles.replyText}>{reply}</Text>
        </View>

        <Text style={styles.prompt}>{t.talk.prompt}</Text>

        <IntentCard
          icon="alert-circle"
          title={t.talk.distressTitle}
          desc={t.talk.distressDesc(family)}
          tone="urgent"
          onPress={() => handleIntent('distress')}
        />
        <IntentCard
          icon="phone"
          title={t.talk.callTitle(family)}
          desc={t.talk.callDesc}
          tone="accent"
          onPress={() => handleIntent('callFamily')}
        />
        <IntentCard
          icon="pill"
          title={t.talk.medsTitle}
          desc={t.talk.medsDesc}
          tone="neutral"
          onPress={() => handleIntent('meds')}
        />
        <IntentCard
          icon="check-circle"
          title={t.talk.checkTitle}
          desc={t.talk.checkDesc}
          tone="neutral"
          onPress={() => handleIntent('checkMeds')}
        />

        {/* Honest note + typed input standing in for on-device STT */}
        <View style={styles.typeRow}>
          <TextInput
            style={styles.input}
            value={typed}
            onChangeText={setTyped}
            placeholder={t.talk.placeholder}
            placeholderTextColor={colors.inkFaint}
            onSubmitEditing={onType}
            returnKeyType="send"
          />
          <Pressable style={styles.send} onPress={onType}>
            <Text style={styles.sendText}>{t.talk.say}</Text>
          </Pressable>
        </View>
        <Text style={styles.note}>{t.talk.note}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function IntentCard({
  icon,
  title,
  desc,
  tone,
  onPress,
}: {
  icon: IconName;
  title: string;
  desc: string;
  tone: 'urgent' | 'accent' | 'neutral';
  onPress: () => void;
}) {
  const accentColor = tone === 'urgent' ? colors.urgent : tone === 'accent' ? colors.accent : colors.accentInk;
  const border = tone === 'urgent' ? colors.urgent : tone === 'accent' ? colors.accent : colors.lineStrong;
  const bg = tone === 'urgent' ? colors.urgentSoft : tone === 'accent' ? colors.accentSoft : colors.surface;
  const wellBg = tone === 'neutral' ? colors.surfaceSunken : 'rgba(255,255,255,0.6)';
  return (
    <Pressable
      style={[styles.card, shadow.card, { borderColor: border, backgroundColor: bg }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${desc}`}
    >
      <View style={[styles.cardIconWell, { backgroundColor: wellBg }]}>
        <Icon name={icon} size={30} color={accentColor} strokeWidth={2.2} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDesc}>{desc}</Text>
      </View>
      <Icon name="chevron-right" size={28} color={colors.inkFaint} />
    </Pressable>
  );
}

function firstName(name?: string | null) {
  return name?.split(' ')[0] ?? 'Your loved one';
}

/** Pick a small-talk line at random from the active language. */
function smalltalk(t: Messages): string {
  const lines = t.spoken.smalltalk;
  return lines[Math.floor(Math.random() * lines.length)];
}

function medsSentence(meds: Medication[], t: Messages): string {
  if (meds.length === 0) return t.spoken.noMeds;
  const parts = meds.map((m) => t.spoken.medItem(m.name, m.dosage.toLowerCase(), t.spoken.schedule[m.schedule]));
  return t.spoken.medsIntro(parts.join('. '));
}

/** Join a set of doses by their friendly names, in the active language's grammar. */
function listFriendly(doses: { med: Medication }[], t: Messages): string {
  const names = Array.from(new Set(doses.map((d) => d.med.friendlyName)));
  return t.spoken.joinList(names);
}

/** Answer "did I take my meds?" from today's dose log, in the active language. */
function takenAnswer(meds: Medication[], doseLogs: DoseLog[], now: number, t: Messages): string {
  const today = todaysDoses(meds, doseLogs, now);
  if (!today.length) return t.spoken.noneScheduledToday;
  const taken = today.filter((d) => d.status === 'taken');
  const pending = today.filter((d) => d.status === 'due' || d.status === 'upcoming');
  const missed = today.filter((d) => d.status === 'missed');

  if (!pending.length && !missed.length && taken.length) {
    return t.spoken.allCaughtUp(listFriendly(taken, t));
  }
  const parts: string[] = [];
  parts.push(taken.length ? t.spoken.alreadyTaken(listFriendly(taken, t)) : t.spoken.notTakenYet);
  if (pending.length) parts.push(t.spoken.stillComing(listFriendly(pending, t)));
  if (missed.length) parts.push(t.spoken.mayHaveMissed(listFriendly(missed, t)));
  return parts.join(' ');
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  scroll: { padding: space.lg },
  replyCard: {
    backgroundColor: colors.accentSoft,
    borderRadius: radius.lg,
    padding: space.lg,
    borderWidth: 1,
    borderColor: colors.accent,
    marginBottom: space.lg,
  },
  replyText: { fontFamily: font.headingMed, fontSize: type.seniorBody, color: colors.accentInk, lineHeight: type.seniorBody * 1.35 },
  prompt: {
    fontFamily: font.bodyBold,
    fontSize: type.caption,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.inkFaint,
    marginBottom: space.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    padding: space.lg,
    marginBottom: space.md,
    minHeight: 96,
  },
  cardIconWell: {
    width: 60,
    height: 60,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { fontFamily: font.displaySemi, fontSize: type.seniorBody, color: colors.ink },
  cardDesc: { fontFamily: font.body, fontSize: type.body, color: colors.inkSoft, marginTop: 2 },

  typeRow: { flexDirection: 'row', gap: space.sm, marginTop: space.md },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: space.md,
    fontSize: type.body,
    color: colors.ink,
    minHeight: 52,
  },
  send: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingHorizontal: space.lg,
    justifyContent: 'center',
  },
  sendText: { color: colors.onAccent, fontWeight: '800', fontSize: type.body },
  note: { fontSize: type.caption, color: colors.inkFaint, marginTop: space.sm, lineHeight: type.caption * 1.5 },
});
