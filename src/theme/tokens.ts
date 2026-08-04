/**
 * Design tokens for Ambient Care.
 *
 * Direction: "warm paper + calm clay" — a soft, reassuring light palette for a
 * product two very different people use: an 80-year-old at their kitchen counter,
 * and their adult child glancing at a phone between meetings. Nothing clinical,
 * nothing alarming until it needs to be. Status color is semantic (calm / check-in
 * / urgent), never decorative.
 */

export const colors = {
  // Surfaces
  paper: '#FBF7F0', // warm off-white background
  surface: '#FFFFFF', // raised cards
  surfaceSunken: '#F1EADE', // insets, input wells
  line: '#E7DECF', // hairline dividers

  // Ink
  ink: '#2A2420', // primary text (warm near-black)
  inkSoft: '#6F655B', // secondary text
  inkFaint: '#A69C90', // tertiary / captions

  // Brand accent — a confident deep teal, used for actions & "connected"
  accent: '#0E7C6B',
  accentSoft: '#D7EBE6',
  accentInk: '#0A5A4E',

  // Semantic status (the whole point of the product)
  calm: '#2F9E6E', // green — all is well
  calmSoft: '#DCF0E4',
  checkIn: '#E0A11E', // amber — worth a look
  checkInSoft: '#FBEBCB',
  urgent: '#D64545', // red — act now
  urgentSoft: '#FADCDA',

  // On-color text
  onAccent: '#FFFFFF',
  onUrgent: '#FFFFFF',
} as const;

export type StatusKey = 'calm' | 'checkIn' | 'urgent';

export const statusMeta: Record<
  StatusKey,
  { label: string; color: string; soft: string; note: string }
> = {
  calm: { label: 'All is well', color: colors.calm, soft: colors.calmSoft, note: 'Normal activity today' },
  checkIn: { label: 'Worth a check-in', color: colors.checkIn, soft: colors.checkInSoft, note: 'Something to glance at' },
  urgent: { label: 'Needs attention', color: colors.urgent, soft: colors.urgentSoft, note: 'Please reach out now' },
};

// Spacing scale (intentional rhythm, not uniform padding everywhere)
export const space = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 36,
  xxl: 56,
} as const;

export const radius = {
  sm: 10,
  md: 18,
  lg: 28,
  pill: 999,
} as const;

// Two type scales: a normal one for the caregiver, and a much larger one for the
// senior surface (readability from an arm's length, no reading glasses needed).
export const type = {
  caption: 13,
  body: 17,
  bodyLg: 20,
  title: 24,
  headline: 30,

  // Senior-facing — deliberately oversized
  seniorBody: 26,
  seniorTitle: 40,
  seniorClock: 88,
  seniorGreeting: 34,
} as const;

export const shadow = {
  card: {
    shadowColor: '#3A2E1E',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  lift: {
    shadowColor: '#3A2E1E',
    shadowOpacity: 0.14,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
} as const;
