/**
 * Text-to-speech. Warm, unhurried, and simple — the voice an 80-year-old hears.
 * expo-speech works in Expo Go with no extra setup. One wrapper keeps tone
 * (rate/pitch) consistent, and reads the loved one's chosen language, voice
 * (accent + gender), and speaking rate from the store so every spoken line comes
 * out in the right voice. Callers pass text already translated via the i18n layer.
 */

import * as Speech from 'expo-speech';
import { useStore } from './store';
import { DEFAULT_LANG, defaultTtsFor } from '../i18n/config';

const DEFAULT_RATE = 0.92; // a touch slower than default
const PITCH = 1.02;

export function say(text: string, onDone?: () => void): void {
  Speech.stop();
  const lo = useStore.getState().lovedOne;
  const lang = lo?.language ?? DEFAULT_LANG;
  const options: Speech.SpeechOptions = {
    rate: lo?.speechRate ?? DEFAULT_RATE,
    pitch: PITCH,
    // A chosen regional voice sets the exact accent; otherwise the language default.
    language: lo?.voiceRegion ?? defaultTtsFor(lang),
    voice: lo?.voiceId,
    onDone,
    onStopped: onDone,
  };
  Speech.speak(text, options);
}

export function stopSpeaking(): void {
  Speech.stop();
}
