/**
 * Locale-aware base font + text direction, applied globally without touching each
 * StyleSheet.
 *
 * The senior surface is designed in Lexend + Source Sans 3, which only cover
 * Latin. For Chinese, Hindi, Arabic, and Bengali those families render "tofu"
 * boxes, so for non-Latin scripts we drop the custom family and let the iOS system
 * font render the script (it ships all of them) — re-deriving weight from the
 * original family name, since `fontWeight` is honored again once no custom family
 * is set. For Arabic we also right-align text globally; explicit `textAlign` in a
 * component's own style still wins (it merges after the base).
 *
 * The active script/direction is a module-level value the I18nProvider updates via
 * `setActiveLocale`; changing it and re-rendering the tree re-runs this patch.
 */

import React from 'react';
import { Text, TextInput, StyleSheet, type TextStyle } from 'react-native';
import type { Dir, Script } from '../i18n/config';
import { font } from './tokens';

type StyledElement = React.ReactElement<{ style?: unknown }>;
type Renderable = { render?: (...args: unknown[]) => StyledElement };

let currentScript: Script = 'latin';
let currentDir: Dir = 'ltr';
let currentDyslexia = false;

/** Map the app's custom Latin families to a weight, for the system-font fallback. */
const FAMILY_WEIGHT: Record<string, TextStyle['fontWeight']> = {
  Lexend_500Medium: '500',
  Lexend_600SemiBold: '600',
  Lexend_700Bold: '700',
  SourceSans3_400Regular: '400',
  SourceSans3_600SemiBold: '600',
  SourceSans3_700Bold: '700',
};

/** Families that read as bold — mapped to Atkinson's bold in easy-read mode. */
const BOLD_FAMILIES = new Set(['Lexend_700Bold', 'Lexend_600SemiBold', 'SourceSans3_700Bold', 'SourceSans3_600SemiBold']);
const BOLD_WEIGHTS = new Set(['600', '700', '800', '900', 'bold']);

/** Called by the I18nProvider whenever the active language changes. */
export function setActiveLocale(script: Script, dir: Dir): void {
  currentScript = script;
  currentDir = dir;
}

/** Easy-read (dyslexia) mode: swap every Text to Atkinson Hyperlegible + tracking. */
export function setDyslexiaFont(on: boolean): void {
  currentDyslexia = on;
}

function wantsBold(style: TextStyle): boolean {
  if (style.fontFamily && BOLD_FAMILIES.has(style.fontFamily)) return true;
  return style.fontWeight != null && BOLD_WEIGHTS.has(String(style.fontWeight));
}

function baseStyle(): TextStyle {
  const rtl = currentDir === 'rtl';
  if (currentDyslexia) {
    // Wider tracking aids letter separation; Atkinson only covers Latin, so the
    // non-Latin scripts keep the system font (still highly legible) + tracking.
    const b: TextStyle = { letterSpacing: 0.4 };
    if (currentScript === 'latin') b.fontFamily = font.dyslexic;
    if (rtl) {
      b.textAlign = 'right';
      b.writingDirection = 'rtl';
    }
    return b;
  }
  if (currentScript === 'latin') return { fontFamily: font.body };
  // Non-Latin: system font (no custom family). Right-align for RTL (Arabic).
  return rtl ? { textAlign: 'right', writingDirection: 'rtl' } : {};
}

/** Rewrite each Text's family for the active locale + easy-read mode. */
function localizeStyle(ownStyle: unknown): unknown {
  const base = baseStyle();
  // Fast path: default Latin, no easy-read — preserve the original behavior exactly.
  if (!currentDyslexia && currentScript === 'latin') return [base, ownStyle];

  const flat = StyleSheet.flatten([base, ownStyle as TextStyle]) as TextStyle;

  if (currentDyslexia) {
    if (currentScript === 'latin') {
      // Force Atkinson everywhere, honoring the original bold/regular intent.
      flat.fontFamily = wantsBold(flat) ? font.dyslexicBold : font.dyslexic;
    } else if (flat.fontFamily && FAMILY_WEIGHT[flat.fontFamily]) {
      flat.fontWeight = flat.fontWeight ?? FAMILY_WEIGHT[flat.fontFamily];
      flat.fontFamily = undefined;
    }
    return flat;
  }

  // Non-Latin, default mode: swap any Latin family for the system font + its weight.
  if (flat.fontFamily && FAMILY_WEIGHT[flat.fontFamily]) {
    return { ...flat, fontFamily: undefined, fontWeight: flat.fontWeight ?? FAMILY_WEIGHT[flat.fontFamily] };
  }
  return flat;
}

function patchBaseFont(Component: Renderable): void {
  const original = Component.render;
  if (typeof original !== 'function') return;
  Component.render = function patched(...args: unknown[]) {
    const element = original.apply(this, args);
    return React.cloneElement(element, { style: localizeStyle(element.props.style) });
  };
}

patchBaseFont(Text as unknown as Renderable);
patchBaseFont(TextInput as unknown as Renderable);
