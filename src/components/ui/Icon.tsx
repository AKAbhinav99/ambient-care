/**
 * Line-icon set (Lucide geometry) rendered with react-native-svg.
 *
 * Replaces emoji glyphs across the app — the single biggest step from "looks
 * AI-generated" to "looks like a real product". Every icon shares a 24×24 grid,
 * a round-joined 2px stroke, and takes its color from the `color` prop, so icons
 * read as one consistent family.
 */

import React from 'react';
import { Svg, Path, Circle, Line, Rect } from 'react-native-svg';
import { colors } from '../../theme/tokens';

type Prim = {
  d?: string;
  circle?: [number, number, number];
  line?: [number, number, number, number];
  rect?: [number, number, number, number, number];
};

const ICONS = {
  check: [{ d: 'M20 6 9 17l-5-5' }],
  'check-circle': [{ circle: [12, 12, 10] }, { d: 'm8.5 12 2.5 2.5 4.5-4.5' }],
  x: [{ d: 'M18 6 6 18' }, { d: 'm6 6 12 12' }],
  'chevron-right': [{ d: 'm9 18 6-6-6-6' }],
  'chevron-left': [{ d: 'm15 18-6-6 6-6' }],
  'arrow-left': [{ d: 'm12 19-7-7 7-7' }, { d: 'M19 12H5' }],
  plus: [{ d: 'M5 12h14' }, { d: 'M12 5v14' }],
  rotate: [{ d: 'M3 12a9 9 0 1 0 3-6.7L3 8' }, { d: 'M3 3v5h5' }],
  refresh: [
    { d: 'M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8' },
    { d: 'M21 3v5h-5' },
    { d: 'M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16' },
    { d: 'M8 16H3v5' },
  ],
  pill: [{ d: 'm10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z' }, { d: 'm8.5 8.5 7 7' }],
  camera: [
    { d: 'M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z' },
    { circle: [12, 13, 3] },
  ],
  mic: [
    { d: 'M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z' },
    { d: 'M19 10v2a7 7 0 0 1-14 0v-2' },
    { line: [12, 19, 12, 22] },
  ],
  phone: [
    {
      d: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z',
    },
  ],
  heart: [
    {
      d: 'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z',
    },
  ],
  settings: [
    {
      d: 'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2Z',
    },
    { circle: [12, 12, 3] },
  ],
  bell: [
    { d: 'M10.268 21a2 2 0 0 0 3.464 0' },
    {
      d: 'M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326',
    },
  ],
  'alert-triangle': [
    { d: 'm21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z' },
    { line: [12, 9, 12, 13] },
    { line: [12, 17, 12.01, 17] },
  ],
  'alert-circle': [{ circle: [12, 12, 10] }, { line: [12, 8, 12, 12] }, { line: [12, 16, 12.01, 16] }],
  info: [{ circle: [12, 12, 10] }, { line: [12, 16, 12, 12] }, { line: [12, 8, 12.01, 8] }],
  'help-circle': [
    { circle: [12, 12, 10] },
    { d: 'M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3' },
    { line: [12, 17, 12.01, 17] },
  ],
  shield: [
    {
      d: 'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1Z',
    },
  ],
  'shield-plus': [
    {
      d: 'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1Z',
    },
    { line: [9, 12, 15, 12] },
    { line: [12, 9, 12, 15] },
  ],
  clock: [{ circle: [12, 12, 10] }, { d: 'M12 6v6l4 2' }],
  volume: [
    { d: 'M11 4.7a.7.7 0 0 0-1.2-.5L6.4 7.6A1.4 1.4 0 0 1 5.4 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.4a1.4 1.4 0 0 1 1 .4l3.4 3.4a.7.7 0 0 0 1.2-.5Z' },
    { d: 'M16 9a5 5 0 0 1 0 6' },
    { d: 'M19.4 5.6a9 9 0 0 1 0 12.8' },
  ],
  'volume-off': [
    { d: 'M11 4.7a.7.7 0 0 0-1.2-.5L6.4 7.6A1.4 1.4 0 0 1 5.4 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.4a1.4 1.4 0 0 1 1 .4l3.4 3.4a.7.7 0 0 0 1.2-.5Z' },
    { line: [22, 9, 16, 15] },
    { line: [16, 9, 22, 15] },
  ],
  link: [
    { d: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71' },
    { d: 'M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71' },
  ],
  message: [{ d: 'M7.9 20A9 9 0 1 0 4 16.1L2 22Z' }],
  'trending-up': [{ d: 'M16 7h6v6' }, { d: 'm22 7-8.5 8.5-5-5L2 17' }],
  'file-text': [
    { d: 'M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z' },
    { d: 'M14 2v4a2 2 0 0 0 2 2h4' },
    { line: [8, 13, 16, 13] },
    { line: [8, 17, 16, 17] },
    { d: 'M10 9H8' },
  ],
  droplet: [
    { d: 'M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7Z' },
  ],
  user: [{ d: 'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2' }, { circle: [12, 7, 4] }],
  layers: [
    { d: 'M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z' },
    { d: 'm22 12.5-9.17 4.16a2 2 0 0 1-1.66 0L2 12.5' },
    { d: 'm22 17.5-9.17 4.16a2 2 0 0 1-1.66 0L2 17.5' },
  ],
  utensils: [
    { d: 'M3 2v7c0 1.1.9 2 2 2a2 2 0 0 0 2-2V2' },
    { d: 'M7 2v20' },
    { d: 'M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7' },
  ],
  stethoscope: [
    { d: 'M11 2v2' },
    { d: 'M5 2v2' },
    { d: 'M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1' },
    { d: 'M8 15v1a6 6 0 0 0 6 6 6 6 0 0 0 6-6v-4' },
    { circle: [20, 10, 2] },
  ],
  activity: [{ d: 'M22 12h-4l-3 9L9 3l-3 9H2' }],
  dot: [{ circle: [12, 12, 2] }],
} satisfies Record<string, Prim[]>;

export type IconName = keyof typeof ICONS;

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
  fill?: string;
}

export function Icon({ name, size = 24, color = colors.ink, strokeWidth = 2, fill = 'none' }: IconProps) {
  const prims: Prim[] = ICONS[name];
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {prims.map((p, i) => {
        if (p.d) return <Path key={i} d={p.d} />;
        if (p.circle) return <Circle key={i} cx={p.circle[0]} cy={p.circle[1]} r={p.circle[2]} />;
        if (p.line) return <Line key={i} x1={p.line[0]} y1={p.line[1]} x2={p.line[2]} y2={p.line[3]} />;
        if (p.rect) return <Rect key={i} x={p.rect[0]} y={p.rect[1]} width={p.rect[2]} height={p.rect[3]} rx={p.rect[4]} />;
        return null;
      })}
    </Svg>
  );
}
