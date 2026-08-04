/**
 * The message shape, derived from the English catalog. Every other language file
 * declares `: Messages`, so `tsc` enforces complete, correctly-typed coverage.
 */

import { en } from './translations/en';

export type Messages = typeof en;
