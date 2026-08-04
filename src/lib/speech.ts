/**
 * Text-to-speech. Warm, unhurried, and simple — the voice an 80-year-old hears.
 * expo-speech works in Expo Go with no extra setup. We keep one wrapper so tone
 * (rate/pitch) stays consistent everywhere the app talks back.
 */

import * as Speech from 'expo-speech';

const VOICE_OPTS: Speech.SpeechOptions = {
  rate: 0.92, // a touch slower than default
  pitch: 1.02,
  language: 'en-US',
};

export function say(text: string, onDone?: () => void): void {
  Speech.stop();
  Speech.speak(text, { ...VOICE_OPTS, onDone, onStopped: onDone });
}

export function stopSpeaking(): void {
  Speech.stop();
}
