/**
 * Voice enumeration for the voice picker.
 *
 * expo-speech exposes the device's installed voices via getAvailableVoicesAsync,
 * but the OS does NOT tag gender — so accent comes from each voice's region
 * (`es-ES` vs `es-MX`, `zh-CN` vs `zh-TW`, …) and gender comes from a curated
 * name→gender map, defaulting to "unknown". Availability is device-dependent: many
 * enhanced voices require a manual download in iOS Settings, and some languages
 * (notably Bengali) ship no voice at all — callers handle an empty list.
 *
 * The mapping is pure and unit-tested; only `listVoicesForLanguage` touches the OS.
 */

import * as Speech from 'expo-speech';
import { langMeta, type LangCode } from '../i18n/config';

export type VoiceGender = 'male' | 'female' | 'unknown';

export interface VoiceOption {
  id: string; // expo-speech voice identifier, passed to Speech.speak
  name: string;
  region: string; // BCP-47 tag, e.g. 'es-MX'
  regionLabel: string; // friendly, e.g. 'Mexico'
  gender: VoiceGender;
}

/** Minimal shape of an expo-speech Voice (kept local so tests need no OS). */
interface RawVoice {
  identifier: string;
  name: string;
  language: string;
}

const FEMALE_NAMES = new Set([
  'samantha', 'karen', 'moira', 'tessa', 'fiona', 'nicky', 'allison', 'ava', 'susan', 'zoe', 'joelle',
  'monica', 'paulina', 'marisol', 'angelica', 'esperanza',
  'tingting', 'meijia', 'sinji', 'lilian',
  'lekha', 'kalpana', 'neel',
]);

const MALE_NAMES = new Set([
  'alex', 'daniel', 'aaron', 'fred', 'arthur', 'gordon', 'oliver', 'rishi', 'tom', 'reed', 'evan',
  'jorge', 'juan', 'diego', 'carlos', 'enrique',
  'limu', 'liangliang',
  'maged', 'tarik', 'majed', 'yaseen',
]);

const REGION_LABELS: Record<string, string> = {
  'en-US': 'United States',
  'en-GB': 'United Kingdom',
  'en-AU': 'Australia',
  'en-IE': 'Ireland',
  'en-IN': 'India',
  'en-ZA': 'South Africa',
  'es-ES': 'Spain',
  'es-MX': 'Mexico',
  'es-US': 'United States',
  'es-AR': 'Argentina',
  'es-CL': 'Chile',
  'es-CO': 'Colombia',
  'zh-CN': 'Mainland China',
  'zh-TW': 'Taiwan',
  'zh-HK': 'Hong Kong',
  'hi-IN': 'India',
  'ar-SA': 'Saudi Arabia',
  'ar-EG': 'Egypt',
  'bn-IN': 'India',
  'bn-BD': 'Bangladesh',
};

/** Lowercase, strip diacritics and non-letters — robust to "Ting-Ting", "Mónica". */
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z]/g, '');
}

export function genderForName(name: string): VoiceGender {
  const n = normalizeName(name);
  if (FEMALE_NAMES.has(n)) return 'female';
  if (MALE_NAMES.has(n)) return 'male';
  return 'unknown';
}

export function regionLabelFor(region: string): string {
  return REGION_LABELS[region] ?? region;
}

/** Filter voices to a language and shape them for the picker (pure, testable). */
export function mapVoices(voices: RawVoice[], iso639: string): VoiceOption[] {
  const prefix = `${iso639.toLowerCase()}-`;
  return voices
    .filter((v) => {
      const lang = v.language.toLowerCase();
      return lang === iso639.toLowerCase() || lang.startsWith(prefix);
    })
    .map((v) => ({
      id: v.identifier,
      name: v.name,
      region: v.language,
      regionLabel: regionLabelFor(v.language),
      gender: genderForName(v.name),
    }))
    .sort(
      (a, b) =>
        a.region.localeCompare(b.region) || a.gender.localeCompare(b.gender) || a.name.localeCompare(b.name),
    );
}

/** Enumerate the device's installed voices for a language. Empty on failure. */
export async function listVoicesForLanguage(code: LangCode): Promise<VoiceOption[]> {
  try {
    const voices = (await Speech.getAvailableVoicesAsync()) as RawVoice[];
    return mapVoices(voices, langMeta(code).iso639);
  } catch {
    return [];
  }
}
