/**
 * Design tokens for Ambient Care.
 *
 * Direction: "modern clinical" — a cool, sleek, high-contrast system for a
 * product two very different people use: an 80-year-old at their kitchen counter,
 * and their adult child glancing at a phone between meetings. Cool architectural
 * neutrals (a whisper of slate-blue, never sand) read modern and premium;
 * disciplined ink contrast and a single deep, trustworthy teal keep it credible.
 * Status color is semantic (calm / check-in / urgent), never decorative.
 *
 * Typography: Lexend (readability-optimized, used for headings + the large senior
 * text) paired with Source Sans 3 (body/UI). Both load in App.tsx; a base-font
 * patch (theme/applyFonts) sets Source Sans 3 on every Text by default.
 */

export const colors = {
  // Surfaces — cool neutrals with a faint slate-blue undertone
  paper: '#F4F6F8', // sleek cool off-white background
  surface: '#FFFFFF', // raised cards
  surfaceSunken: '#EAEEF2', // insets, input wells
  line: '#E3E8ED', // hairline dividers
  lineStrong: '#CDD5DE', // stronger separators / input borders

  // Ink (cool slate neutrals, tuned for >= 4.5:1 on paper/surface)
  ink: '#12171E', // primary text
  inkSoft: '#505A66', // secondary text
  inkFaint: '#6B7480', // tertiary / captions

  // Brand accent — a deep, confident, modern teal
  accent: '#0F766E',
  accentSoft: '#D3E7E4',
  accentInk: '#0B5E57',

  // Semantic status
  calm: '#2E9A67', // green — all is well
  calmSoft: '#DBEFE3',
  calmInk: '#1C6B45',
  checkIn: '#B77C17', // amber — worth a look (darkened for white-on-color)
  checkInSoft: '#FAEBCB',
  checkInInk: '#8A5B10',
  urgent: '#C43B36', // red — act now
  urgentSoft: '#F8D9D6',
  urgentInk: '#8E2723',

  // On-color text
  onAccent: '#FFFFFF',
  onUrgent: '#FFFFFF',
  onStatus: '#FFFFFF',

  // Focus ring
  focus: '#0F766E',
} as const;

export type StatusKey = 'calm' | 'checkIn' | 'urgent';

export const statusMeta: Record<
  StatusKey,
  { label: string; color: string; soft: string; ink: string; note: string }
> = {
  calm: { label: 'All is well', color: colors.calm, soft: colors.calmSoft, ink: colors.calmInk, note: 'Normal activity today' },
  checkIn: { label: 'Worth a check-in', color: colors.checkIn, soft: colors.checkInSoft, ink: colors.checkInInk, note: 'Something to glance at' },
  urgent: { label: 'Needs attention', color: colors.urgent, soft: colors.urgentSoft, ink: colors.urgentInk, note: 'Please reach out now' },
};

// Typography families (loaded via @expo-google-fonts in App.tsx)
export const font = {
  display: 'Lexend_700Bold',
  displaySemi: 'Lexend_600SemiBold',
  heading: 'Lexend_600SemiBold',
  headingBold: 'Lexend_700Bold',
  headingMed: 'Lexend_500Medium',
  body: 'SourceSans3_400Regular',
  bodyMed: 'SourceSans3_600SemiBold',
  bodyBold: 'SourceSans3_700Bold',
} as const;

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
  md: 16,
  lg: 24,
  pill: 999,
} as const;

// Two type scales: a normal one for the caregiver, and a much larger one for the
// senior surface (readability from an arm's length, no reading glasses needed).
export const type = {
  caption: 14,
  body: 17,
  bodyLg: 20,
  title: 24,
  headline: 30,

  // Senior-facing — deliberately oversized
  seniorBody: 26,
  seniorTitle: 40,
  seniorClock: 84,
  seniorGreeting: 32,
} as const;

// Elevation — soft, cool, layered (not the harsh default RN shadow)
export const shadow = {
  card: {
    shadowColor: '#0F1B2A',
    shadowOpacity: 0.07,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  lift: {
    shadowColor: '#0F1B2A',
    shadowOpacity: 0.14,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
} as const;
