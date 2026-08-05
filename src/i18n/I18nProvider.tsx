/**
 * Language context for the senior surface.
 *
 * The active language is role-scoped: the senior surface uses the language chosen
 * for the loved one; every other surface (caregiver) stays English. That keeps
 * shared components (Emergency Card, etc.) English on the caregiver side and
 * localized on the senior side with a single provider and no per-call plumbing.
 *
 * `setActiveLocale` is called during render so the global font/direction patch
 * (theme/applyFonts) is in sync before children paint — no flash of the wrong
 * script when the language switches.
 */

import React, { createContext, useContext, useMemo } from 'react';
import { useStore } from '../lib/store';
import { setActiveLocale, setDyslexiaFont } from '../theme/applyFonts';
import { setColorScheme } from '../theme/tokens';
import { catalogFor } from './catalogs';
import { DEFAULT_LANG, langMeta, type Dir, type LangCode, type Script } from './config';
import type { Messages } from './types';

interface I18nValue {
  t: Messages;
  lang: LangCode;
  dir: Dir;
  script: Script;
  setLang: (code: LangCode) => void;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const role = useStore((s) => s.role);
  const language = useStore((s) => s.lovedOne?.language);
  const dyslexiaFont = useStore((s) => s.lovedOne?.dyslexiaFont);
  const colorScheme = useStore((s) => s.lovedOne?.colorScheme);
  const updateLovedOne = useStore((s) => s.updateLovedOne);

  const isSenior = role === 'senior';
  // Only the senior surface localizes; everything else is English.
  const lang: LangCode = isSenior ? language ?? DEFAULT_LANG : DEFAULT_LANG;
  const meta = langMeta(lang);

  // Keep the global font/direction/color patches in sync before children render.
  // The easy-read font is scoped to the senior surface; the color-blind palette is
  // applied app-wide so the caregiver's status dashboard recolors too.
  setActiveLocale(meta.script, meta.dir);
  setDyslexiaFont(isSenior && !!dyslexiaFont);
  setColorScheme(colorScheme ?? 'default');

  const value = useMemo<I18nValue>(
    () => ({
      t: catalogFor(lang),
      lang,
      dir: meta.dir,
      script: meta.script,
      setLang: (code: LangCode) => updateLovedOne({ language: code }),
    }),
    // dyslexiaFont/colorScheme/isSenior are in the deps so a change re-renders the
    // tree and the just-applied font/color patches take effect on the next paint.
    [lang, meta.dir, meta.script, updateLovedOne, dyslexiaFont, colorScheme, isSenior],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useT(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useT must be used within I18nProvider');
  return ctx;
}
