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
import { setActiveLocale } from '../theme/applyFonts';
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
  const updateLovedOne = useStore((s) => s.updateLovedOne);

  // Only the senior surface localizes; everything else is English.
  const lang: LangCode = role === 'senior' ? language ?? DEFAULT_LANG : DEFAULT_LANG;
  const meta = langMeta(lang);

  // Keep the global font/direction patch in sync before children render.
  setActiveLocale(meta.script, meta.dir);

  const value = useMemo<I18nValue>(
    () => ({
      t: catalogFor(lang),
      lang,
      dir: meta.dir,
      script: meta.script,
      setLang: (code: LangCode) => updateLovedOne({ language: code }),
    }),
    [lang, meta.dir, meta.script, updateLovedOne],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useT(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useT must be used within I18nProvider');
  return ctx;
}
