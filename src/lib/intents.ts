/**
 * Intent matching for the voice interface.
 *
 * Expo Go reality: there is no reliable on-device speech-to-text in Expo Go.
 * Real always-listening STT needs a custom dev build (e.g. expo-speech-recognition
 * or @react-native-voice/voice) or the native Swift Speech framework. So on the
 * senior surface we present a few big, obvious spoken-intent cards instead of a
 * hidden always-on mic — which is arguably kinder for this user anyway.
 *
 * This module is still the real NLU layer: given a phrase (typed, tapped, or one
 * day transcribed), it maps to one of a small hardcoded intent set. Swap the
 * input source later without touching this logic.
 */

export type IntentId = 'distress' | 'callFamily' | 'checkMeds' | 'meds' | 'smalltalk';

interface IntentDef {
  id: IntentId;
  /** Spoken/typed patterns that map to this intent. */
  patterns: RegExp[];
}

const INTENTS: IntentDef[] = [
  {
    // Checked BEFORE `meds` so "did I take my pills?" isn't caught by the generic query.
    id: 'checkMeds',
    patterns: [
      /did i (already )?(take|have)/i,
      /have i (taken|had)/i,
      /already (take|took|had)/i,
      /took my (pills?|medicine|meds|medication)/i,
    ],
  },
  {
    id: 'distress',
    patterns: [
      /don'?t feel (good|well)/i,
      /feel (sick|dizzy|bad|awful|faint|weak)/i,
      /need help/i,
      /help me/i,
      /something(?:'s| is) wrong/i,
    ],
  },
  {
    id: 'callFamily',
    patterns: [/call (my )?(daughter|son|family|kid|child|[a-z]+)/i, /phone (my )?[a-z]+/i],
  },
  {
    id: 'meds',
    patterns: [
      /what pills?/i,
      /which (pills?|medicine|meds)/i,
      /my (medicine|meds|medication)/i,
      /(do|should) i take/i,
    ],
  },
];

export function matchIntent(phrase: string): IntentId {
  const text = phrase.trim();
  for (const intent of INTENTS) {
    if (intent.patterns.some((p) => p.test(text))) return intent.id;
  }
  return 'smalltalk';
}

/** A few gentle small-talk replies for anything unmatched. */
const SMALLTALK = [
  "I'm right here with you. Is there anything you need?",
  "That's nice. I'm listening if you need anything.",
  "I'm keeping an eye on things for you. You can always ask me for your pills, or to call your family.",
];

export function smalltalkReply(): string {
  return SMALLTALK[Math.floor(Math.random() * SMALLTALK.length)];
}
