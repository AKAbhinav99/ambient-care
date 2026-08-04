/**
 * Sets Source Sans 3 as the default font on every <Text> and <TextInput> without
 * having to touch each StyleSheet. Any explicit `fontFamily` in a component's own
 * style still wins (it's merged after the base). Headings opt into Lexend via the
 * `font` tokens. Importing this module once (in App.tsx) applies the patch.
 */

import React from 'react';
import { Text, TextInput } from 'react-native';
import { font } from './tokens';

type StyledElement = React.ReactElement<{ style?: unknown }>;
type Renderable = { render?: (...args: unknown[]) => StyledElement };

function patchBaseFont(Component: Renderable, family: string): void {
  const original = Component.render;
  if (typeof original !== 'function') return;
  Component.render = function patched(...args: unknown[]) {
    const element = original.apply(this, args);
    return React.cloneElement(element, {
      style: [{ fontFamily: family }, element.props.style],
    });
  };
}

patchBaseFont(Text as unknown as Renderable, font.body);
patchBaseFont(TextInput as unknown as Renderable, font.body);
