/**
 * Offline drug-interaction reference.
 *
 * IMPORTANT: general information, NOT medical advice. This is a small, curated set
 * of well-known, high-signal interactions — not a comprehensive clinical database.
 * The UI always shows `DISCLAIMER` beside any warning and never tells the user to
 * stop or change a medication. Confirm everything with a pharmacist or doctor.
 *
 * Why offline: the NIH RxNorm/ONCHigh interaction API was retired in 2024, and an
 * offline table is more reliable in Expo Go (no keys, no network) and good enough
 * to catch the combinations that matter most for an older adult on several meds.
 */

import type { Medication } from '../types';

export const DISCLAIMER =
  'General information, not medical advice. Always confirm with a pharmacist or doctor. ' +
  'Never stop or change a medication without professional guidance.';

export type InteractionSeverity = 'major' | 'moderate' | 'minor';

export interface Warning {
  severity: InteractionSeverity;
  a: string; // display name of med A (as entered)
  b: string; // display name of med B, or a food/lifestyle label
  reason: string; // plain-language "why"
  advice: string; // plain-language "what to do"
  kind: 'pair' | 'duplicate' | 'food';
}

/** Brand → generic aliases so "Lipitor" resolves like "atorvastatin". */
const ALIASES: Record<string, string> = {
  lipitor: 'atorvastatin',
  zocor: 'simvastatin',
  coumadin: 'warfarin',
  jantoven: 'warfarin',
  bayer: 'aspirin',
  ecotrin: 'aspirin',
  advil: 'ibuprofen',
  motrin: 'ibuprofen',
  aleve: 'naproxen',
  glucophage: 'metformin',
  prinivil: 'lisinopril',
  zestril: 'lisinopril',
  cozaar: 'losartan',
  norvasc: 'amlodipine',
  xanax: 'alprazolam',
  ativan: 'lorazepam',
  valium: 'diazepam',
  ambien: 'zolpidem',
  zoloft: 'sertraline',
  prozac: 'fluoxetine',
  ultram: 'tramadol',
  oxycontin: 'oxycodone',
  percocet: 'oxycodone',
  norco: 'hydrocodone',
  vicodin: 'hydrocodone',
  synthroid: 'levothyroxine',
  lasix: 'furosemide',
  plavix: 'clopidogrel',
  prilosec: 'omeprazole',
};

/** Generic → class/feature tags used by the rules below. */
const DRUG_TAGS: Record<string, string[]> = {
  lisinopril: ['ace-inhibitor', 'ras-acting'],
  losartan: ['arb', 'ras-acting'],
  metformin: ['biguanide'],
  atorvastatin: ['statin', 'grapefruit-sensitive'],
  simvastatin: ['statin', 'grapefruit-sensitive'],
  amlodipine: ['ccb', 'grapefruit-sensitive'],
  warfarin: ['anticoagulant', 'bleed-risk', 'vitk-sensitive'],
  aspirin: ['nsaid', 'antiplatelet', 'bleed-risk'],
  ibuprofen: ['nsaid', 'bleed-risk'],
  naproxen: ['nsaid', 'bleed-risk'],
  clopidogrel: ['antiplatelet', 'bleed-risk'],
  sertraline: ['ssri', 'serotonergic', 'bleed-risk'],
  fluoxetine: ['ssri', 'serotonergic', 'bleed-risk'],
  tramadol: ['opioid', 'serotonergic', 'cns-depressant'],
  oxycodone: ['opioid', 'cns-depressant'],
  hydrocodone: ['opioid', 'cns-depressant'],
  alprazolam: ['benzodiazepine', 'cns-depressant'],
  lorazepam: ['benzodiazepine', 'cns-depressant'],
  diazepam: ['benzodiazepine', 'cns-depressant'],
  zolpidem: ['z-drug', 'cns-depressant'],
  gabapentin: ['cns-depressant'],
  spironolactone: ['potassium-sparing', 'raises-potassium'],
  potassium: ['raises-potassium'],
  digoxin: ['digoxin', 'narrow-therapeutic'],
  furosemide: ['loop-diuretic', 'lowers-potassium'],
  hydrochlorothiazide: ['thiazide', 'lowers-potassium'],
  levothyroxine: ['thyroid'],
  insulin: ['hypoglycemic'],
  glipizide: ['sulfonylurea', 'hypoglycemic'],
};

interface PairRule {
  a: string;
  b: string;
  severity: InteractionSeverity;
  reason: string;
  advice: string;
}

const PAIR_RULES: PairRule[] = [
  {
    a: 'bleed-risk',
    b: 'bleed-risk',
    severity: 'major',
    reason: 'Two medicines that each raise bleeding risk, together, can cause serious internal bleeding.',
    advice:
      'Ask the prescriber whether both are truly needed, and watch for unusual bruising, dark or bloody stools, or bleeding that won’t stop.',
  },
  {
    a: 'cns-depressant',
    b: 'cns-depressant',
    severity: 'major',
    reason: 'Two sedating medicines together can dangerously slow breathing and cause heavy drowsiness or falls.',
    advice: 'Especially risky at night. Ask about alternatives or spacing doses, and be alert to confusion or trouble waking.',
  },
  {
    a: 'serotonergic',
    b: 'serotonergic',
    severity: 'major',
    reason: 'Two medicines that raise serotonin can trigger serotonin syndrome — agitation, fever, and a racing heart.',
    advice: 'Seek help urgently for those symptoms; ask the prescriber to review the combination.',
  },
  {
    a: 'ras-acting',
    b: 'raises-potassium',
    severity: 'moderate',
    reason: 'An ACE inhibitor or ARB together with a potassium-raising medicine can push potassium too high and affect the heart.',
    advice: 'Usually needs periodic blood tests. Confirm the prescriber is monitoring potassium.',
  },
  {
    a: 'raises-potassium',
    b: 'raises-potassium',
    severity: 'moderate',
    reason: 'Stacking potassium-raising medicines can drive potassium to dangerous levels.',
    advice: 'Ask whether potassium levels are being checked regularly.',
  },
  {
    a: 'narrow-therapeutic',
    b: 'lowers-potassium',
    severity: 'moderate',
    reason: 'Low potassium from a water pill can make digoxin build up to toxic levels.',
    advice: 'Watch for nausea, vision changes, or an irregular pulse, and confirm levels are monitored.',
  },
  {
    a: 'hypoglycemic',
    b: 'hypoglycemic',
    severity: 'moderate',
    reason: 'Two blood-sugar-lowering medicines together raise the chance of a low-sugar episode.',
    advice: 'Keep fast-acting sugar on hand and watch for shakiness, sweating, or confusion.',
  },
];

interface DuplicateRule {
  tag: string;
  severity: InteractionSeverity;
  reason: string;
  advice: string;
}

const DUPLICATE_RULES: DuplicateRule[] = [
  {
    tag: 'nsaid',
    severity: 'moderate',
    reason: 'Taking two anti-inflammatory pain relievers at once adds stomach-bleeding and kidney risk without extra benefit.',
    advice: 'Usually only one is needed — confirm with a pharmacist.',
  },
  {
    tag: 'ssri',
    severity: 'major',
    reason: 'Two antidepressants of the same type together raise the risk of serotonin syndrome.',
    advice: 'This combination is usually avoided; ask the prescriber to review it.',
  },
  {
    tag: 'benzodiazepine',
    severity: 'moderate',
    reason: 'Two sedatives of the same family compound drowsiness and fall risk.',
    advice: 'Ask whether both are needed.',
  },
  {
    tag: 'statin',
    severity: 'moderate',
    reason: 'Two cholesterol statins together increase the risk of muscle damage.',
    advice: 'Report unexplained muscle pain or weakness and confirm both are intended.',
  },
  {
    tag: 'ras-acting',
    severity: 'moderate',
    reason: 'An ACE inhibitor and an ARB together is usually avoided — combined kidney and potassium risk.',
    advice: 'Confirm with the prescriber; this pairing is rarely intended.',
  },
];

interface FoodRule {
  tag: string;
  food: string;
  severity: InteractionSeverity;
  reason: string;
  advice: string;
}

const FOOD_RULES: FoodRule[] = [
  {
    tag: 'grapefruit-sensitive',
    food: 'Grapefruit',
    severity: 'moderate',
    reason: 'Grapefruit can raise this medicine’s level in the blood and increase side effects.',
    advice: 'Avoid grapefruit and grapefruit juice, or ask your pharmacist about timing.',
  },
  {
    tag: 'cns-depressant',
    food: 'Alcohol',
    severity: 'major',
    reason: 'Alcohol adds to the sedative effect — dangerous drowsiness and a real fall risk.',
    advice: 'Avoid alcohol while taking this medicine.',
  },
  {
    tag: 'nsaid',
    food: 'Alcohol',
    severity: 'moderate',
    reason: 'Alcohol with anti-inflammatory pain relievers raises stomach-bleeding risk.',
    advice: 'Limit or avoid alcohol.',
  },
  {
    tag: 'vitk-sensitive',
    food: 'Leafy greens (vitamin K)',
    severity: 'moderate',
    reason: 'Big swings in vitamin K change how well warfarin works.',
    advice: 'Keep leafy-green intake steady rather than cutting it out suddenly.',
  },
  {
    tag: 'biguanide',
    food: 'Alcohol',
    severity: 'moderate',
    reason: 'Heavy alcohol with metformin raises the risk of a rare but serious acid buildup.',
    advice: 'Avoid heavy drinking.',
  },
];

const SEVERITY_RANK: Record<InteractionSeverity, number> = { major: 0, moderate: 1, minor: 2 };

/** Reduce a med to its generic name. */
export function normalizeGeneric(med: Pick<Medication, 'name' | 'genericName'>): string {
  if (med.genericName) return med.genericName.trim().toLowerCase();
  const tokens = med.name.toLowerCase().split(/[^a-z]+/).filter(Boolean);
  for (const t of tokens) {
    if (ALIASES[t]) return ALIASES[t];
    if (DRUG_TAGS[t]) return t;
  }
  return tokens[0] ?? med.name.trim().toLowerCase();
}

function tagsFor(med: Medication): Set<string> {
  const generic = normalizeGeneric(med);
  return new Set<string>([generic, ...(DRUG_TAGS[generic] ?? [])]);
}

/** Pairwise + duplicate-therapy + food/lifestyle scan of the current med list. */
export function checkInteractions(meds: Medication[]): Warning[] {
  const resolved = meds.map((med) => ({ med, tags: tagsFor(med) }));
  const out: Warning[] = [];
  const seen = new Set<string>();

  const push = (w: Warning) => {
    const names = [w.a, w.b].sort().join('|');
    const key = `${w.kind}|${w.severity}|${names}|${w.reason}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push(w);
  };

  // Pairwise interactions.
  for (let i = 0; i < resolved.length; i++) {
    for (let j = i + 1; j < resolved.length; j++) {
      const ri = resolved[i];
      const rj = resolved[j];
      for (const rule of PAIR_RULES) {
        const hit =
          (ri.tags.has(rule.a) && rj.tags.has(rule.b)) ||
          (ri.tags.has(rule.b) && rj.tags.has(rule.a));
        if (hit) {
          push({
            severity: rule.severity,
            a: ri.med.name,
            b: rj.med.name,
            reason: rule.reason,
            advice: rule.advice,
            kind: 'pair',
          });
        }
      }
    }
  }

  // Duplicate therapy (two+ meds in the same class).
  for (const rule of DUPLICATE_RULES) {
    const matches = resolved.filter((r) => r.tags.has(rule.tag));
    if (matches.length >= 2) {
      push({
        severity: rule.severity,
        a: matches[0].med.name,
        b: matches.slice(1).map((m) => m.med.name).join(', '),
        reason: rule.reason,
        advice: rule.advice,
        kind: 'duplicate',
      });
    }
  }

  // Food / lifestyle cautions (per med).
  for (const r of resolved) {
    for (const rule of FOOD_RULES) {
      if (r.tags.has(rule.tag)) {
        push({
          severity: rule.severity,
          a: r.med.name,
          b: rule.food,
          reason: rule.reason,
          advice: rule.advice,
          kind: 'food',
        });
      }
    }
  }

  return out.sort((x, y) => SEVERITY_RANK[x.severity] - SEVERITY_RANK[y.severity]);
}
