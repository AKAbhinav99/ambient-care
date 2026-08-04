/**
 * Language configuration for the senior surface.
 *
 * Six languages ship: English (default) plus Spanish, Mandarin Chinese, Hindi,
 * Arabic, and Bengali. Each carries the metadata the rest of the app needs:
 *  - `script` drives font handling (theme/applyFonts): Latin keeps Lexend/Source
 *    Sans; the others fall back to the iOS system font, which ships every script.
 *  - `dir` drives right-to-left text (Arabic).
 *  - `defaultTts` is the BCP-47 tag handed to expo-speech when the user hasn't
 *    picked a specific regional voice yet.
 *  - `iso639` is the bare language code used to filter the device's voice list.
 */

export type LangCode = 'en' | 'es' | 'zh' | 'hi' | 'ar' | 'bn';
export type Script = 'latin' | 'cjk' | 'devanagari' | 'arabic' | 'bengali';
export type Dir = 'ltr' | 'rtl';

export interface LanguageMeta {
  code: LangCode;
  /** Shown to the user in its own script — never translated. */
  nativeLabel: string;
  /** English name, for caregiver-facing UI. */
  englishLabel: string;
  dir: Dir;
  script: Script;
  /** Default voice locale when the user hasn't chosen a specific accent. */
  defaultTts: string;
  /** ISO-639 prefix used to match device voices for this language. */
  iso639: string;
}

export const LANGUAGES: LanguageMeta[] = [
  { code: 'en', nativeLabel: 'English', englishLabel: 'English', dir: 'ltr', script: 'latin', defaultTts: 'en-US', iso639: 'en' },
  { code: 'es', nativeLabel: 'Español', englishLabel: 'Spanish', dir: 'ltr', script: 'latin', defaultTts: 'es-ES', iso639: 'es' },
  { code: 'zh', nativeLabel: '中文', englishLabel: 'Mandarin Chinese', dir: 'ltr', script: 'cjk', defaultTts: 'zh-CN', iso639: 'zh' },
  { code: 'hi', nativeLabel: 'हिन्दी', englishLabel: 'Hindi', dir: 'ltr', script: 'devanagari', defaultTts: 'hi-IN', iso639: 'hi' },
  { code: 'ar', nativeLabel: 'العربية', englishLabel: 'Arabic', dir: 'rtl', script: 'arabic', defaultTts: 'ar-SA', iso639: 'ar' },
  { code: 'bn', nativeLabel: 'বাংলা', englishLabel: 'Bengali', dir: 'ltr', script: 'bengali', defaultTts: 'bn-IN', iso639: 'bn' },
];

export const DEFAULT_LANG: LangCode = 'en';

export function langMeta(code: LangCode): LanguageMeta {
  return LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];
}

export function defaultTtsFor(code: LangCode): string {
  return langMeta(code).defaultTts;
}

export function isRtl(code: LangCode): boolean {
  return langMeta(code).dir === 'rtl';
}

/** True when the language renders in a non-Latin script (needs the system font). */
export function isNonLatin(code: LangCode): boolean {
  return langMeta(code).script !== 'latin';
}
