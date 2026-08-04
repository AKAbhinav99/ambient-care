import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../../lib/store';
import { say } from '../../lib/speech';
import { fireAlert } from '../../lib/notifications';
import { matchIntent, smalltalkReply, type IntentId } from '../../lib/intents';
import { colors, space, type, radius, shadow } from '../../theme/tokens';
import type { SeniorProps } from '../../navigation/types';

export function VoiceScreen(_: SeniorProps<'Voice'>) {
  const lovedOne = useStore((s) => s.lovedOne);
  const medications = useStore((s) => s.medications);
  const logEvent = useStore((s) => s.logEvent);

  const [reply, setReply] = useState<string>(
    "Tap what you'd like, or type below. I'm listening.",
  );
  const [typed, setTyped] = useState('');

  const family = lovedOne?.relationship ?? 'your family';
  const familyName = lovedOne ? `your ${lovedOne.relationship.toLowerCase()}` : 'your family';

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
        respond(`I've let ${familyName} know right away. Please sit down and stay where you are — help is coming.`);
        break;
      }
      case 'callFamily': {
        logEvent({
          kind: 'voice_call',
          severity: 'checkIn',
          title: `${firstName(lovedOne?.name)} asked to call ${family}`,
        });
        respond(`Okay, I'm calling ${familyName} for you now.`);
        break;
      }
      case 'meds': {
        logEvent({
          kind: 'voice_meds',
          severity: 'info',
          title: `${firstName(lovedOne?.name)} asked about their medicine`,
        });
        respond(medsSentence(medications));
        break;
      }
      default:
        respond(smalltalkReply());
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

        <Text style={styles.prompt}>What would you like?</Text>

        <IntentCard
          icon="🆘"
          title="I don't feel good"
          desc={`Tells ${familyName} right away`}
          tone="urgent"
          onPress={() => handleIntent('distress')}
        />
        <IntentCard
          icon="📞"
          title={`Call ${family}`}
          desc="Reach your family now"
          tone="accent"
          onPress={() => handleIntent('callFamily')}
        />
        <IntentCard
          icon="💊"
          title="What pills do I take?"
          desc="I'll read your list out loud"
          tone="neutral"
          onPress={() => handleIntent('meds')}
        />

        {/* Honest note + typed input standing in for on-device STT */}
        <View style={styles.typeRow}>
          <TextInput
            style={styles.input}
            value={typed}
            onChangeText={setTyped}
            placeholder="Or type what you'd say…"
            placeholderTextColor={colors.inkFaint}
            onSubmitEditing={onType}
            returnKeyType="send"
          />
          <Pressable style={styles.send} onPress={onType}>
            <Text style={styles.sendText}>Say</Text>
          </Pressable>
        </View>
        <Text style={styles.note}>
          In Expo Go this stands in for always-listening speech-to-text, which needs a custom dev
          build. The intent matching is the real thing.
        </Text>
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
  icon: string;
  title: string;
  desc: string;
  tone: 'urgent' | 'accent' | 'neutral';
  onPress: () => void;
}) {
  const border =
    tone === 'urgent' ? colors.urgent : tone === 'accent' ? colors.accent : colors.line;
  const bg = tone === 'urgent' ? colors.urgentSoft : tone === 'accent' ? colors.accentSoft : colors.surface;
  return (
    <Pressable style={[styles.card, shadow.card, { borderColor: border, backgroundColor: bg }]} onPress={onPress}>
      <Text style={styles.cardIcon}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDesc}>{desc}</Text>
      </View>
      <Text style={styles.chev}>›</Text>
    </Pressable>
  );
}

function firstName(name?: string | null) {
  return name?.split(' ')[0] ?? 'Your loved one';
}

function medsSentence(meds: { name: string; schedule: string; dosage: string }[]): string {
  if (meds.length === 0) return "I don't have any medicines on your list yet. Ask your family to add them.";
  const parts = meds.map((m) => `${m.name}, ${m.dosage.toLowerCase()}, in the ${scheduleWord(m.schedule)}`);
  return `Here's your medicine. ${parts.join('. ')}.`;
}

function scheduleWord(s: string) {
  switch (s) {
    case 'morning':
      return 'morning';
    case 'midday':
      return 'middle of the day';
    case 'evening':
      return 'evening';
    case 'bedtime':
      return 'evening at bedtime';
    default:
      return 'as needed';
  }
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
  replyText: { fontSize: type.seniorBody, color: colors.accentInk, fontWeight: '600', lineHeight: type.seniorBody * 1.35 },
  prompt: {
    fontSize: type.caption,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: colors.inkFaint,
    marginBottom: space.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    borderRadius: radius.lg,
    borderWidth: 2,
    padding: space.lg,
    marginBottom: space.md,
    minHeight: 96,
  },
  cardIcon: { fontSize: 44 },
  cardTitle: { fontSize: type.seniorBody, fontWeight: '800', color: colors.ink },
  cardDesc: { fontSize: type.body, color: colors.inkSoft, marginTop: 2 },
  chev: { fontSize: 34, color: colors.inkFaint },

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
