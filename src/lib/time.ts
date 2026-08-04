/** Human, friendly time formatting for the log and dashboards. */

export type PartOfDay = 'morning' | 'afternoon' | 'evening';

export function relativeTime(at: number | null): string {
  if (!at) return 'no activity yet';
  const diff = Date.now() - at;
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  return `${days}d ago`;
}

export function clockTime(d: Date, locale?: string): string {
  return d.toLocaleTimeString(locale ? [locale] : [], { hour: 'numeric', minute: '2-digit' });
}

export function longDate(d: Date, locale?: string): string {
  return d.toLocaleDateString(locale ? [locale] : [], { weekday: 'long', month: 'long', day: 'numeric' });
}

/** The part of day, used to pick a localized greeting ("Good morning" …). */
export function partOfDay(d: Date): PartOfDay {
  const h = d.getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

/** English greeting for the caregiver surface (the senior surface localizes via i18n). */
export function greeting(d: Date): string {
  const p = partOfDay(d);
  return p === 'morning' ? 'Good morning' : p === 'afternoon' ? 'Good afternoon' : 'Good evening';
}
