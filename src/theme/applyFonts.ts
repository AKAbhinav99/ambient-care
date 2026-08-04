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

/** Map the app's custom Latin families to a weight, for the system-font fallback. */
const FAMILY_WEIGHT: Record<string, TextStyle['fontWeight']> = {
  Lexend_500Medium: '500',
  Lexend_600SemiBold: '600',
  Lexend_700Bold: '700',
  SourceSans3_400Regular: '400',
  SourceSans3_600SemiBold: '600',
  SourceSans3_700Bold: '700',
};

/** Called by the I18nProvider whenever the active language changes. */
export function setActiveLocale(script: Script, dir: Dir): void {
  currentScript = script;
  currentDir = dir;
}

function baseStyle(): TextStyle {
  if (currentScript === 'latin') return { fontFamily: font.body };
  // Non-Latin: system font (no custom family). Right-align for RTL (Arabic).
  return currentDir === 'rtl' ? { textAlign: 'right', writingDirection: 'rtl' } : {};
}

/** For non-Latin scripts, swap any Latin family for the system font + its weight. */
function localizeStyle(ownStyle: unknown): unknown {
  const base = baseStyle();
  if (currentScript === 'latin') {
    // Preserve the original behavior exactly for Latin languages.
    return [base, ownStyle];
  }
  const flat = StyleSheet.flatten([base, ownStyle as TextStyle]) as TextStyle;
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
