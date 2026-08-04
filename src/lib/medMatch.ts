/**
 * Match a scan against the caregiver's logged medication list.
 *
 * Expo Go reality: real OCR of a bottle label (Apple Vision / ML Kit text
 * recognition) is not available in Expo Go — that's a dev-build feature. Barcode
 * scanning IS available in Expo Go via expo-camera, so the real path here matches
 * a scanned barcode to a logged medication's `barcode`. When a med has no barcode
 * on file, the scan screen offers a manual pick so the confirm/mismatch flow is
 * still exercised end to end.
 */

import type { Medication } from '../types';

export interface MatchResult {
  matched: boolean;
  med?: Medication;
}

export function matchByBarcode(meds: Medication[], barcode: string): MatchResult {
  const med = meds.find((m) => m.barcode && m.barcode === barcode.trim());
  return med ? { matched: true, med } : { matched: false };
}
