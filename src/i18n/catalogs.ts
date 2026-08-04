/**
 * Registry of language catalogs. Pure — it imports no store, so any module
 * (including notifications) can resolve a catalog by code without a hook or a
 * circular import.
 */

import type { LangCode } from './config';
import type { Messages } from './types';
import { en } from './translations/en';
import { es } from './translations/es';
import { zh } from './translations/zh';
import { hi } from './translations/hi';
import { ar } from './translations/ar';
import { bn } from './translations/bn';

export const CATALOGS: Record<LangCode, Messages> = { en, es, zh, hi, ar, bn };

/** Resolve a catalog, always falling back to English. */
export function catalogFor(code: LangCode | undefined | null): Messages {
  return (code && CATALOGS[code]) || en;
}
