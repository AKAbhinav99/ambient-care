// expo-speech is a native module; mock it so importing voices.ts is node-safe.
// Only the pure mapping functions are exercised here.
jest.mock('expo-speech', () => ({}));

import { genderForName, regionLabelFor, mapVoices } from '../voices';

describe('genderForName', () => {
  test('maps known female voices', () => {
    expect(genderForName('Samantha')).toBe('female');
    expect(genderForName('Mónica')).toBe('female'); // diacritics stripped
    expect(genderForName('Ting-Ting')).toBe('female'); // hyphen stripped
  });

  test('maps known male voices', () => {
    expect(genderForName('Daniel')).toBe('male');
    expect(genderForName('Jorge')).toBe('male');
    expect(genderForName('Maged')).toBe('male');
  });

  test('falls back to unknown for unrecognized names', () => {
    expect(genderForName('Zxqwerty')).toBe('unknown');
  });
});

describe('regionLabelFor', () => {
  test('labels known regions', () => {
    expect(regionLabelFor('es-MX')).toBe('Mexico');
    expect(regionLabelFor('zh-TW')).toBe('Taiwan');
  });

  test('falls back to the raw tag for unknown regions', () => {
    expect(regionLabelFor('xx-YY')).toBe('xx-YY');
  });
});

describe('mapVoices', () => {
  const raw = [
    { identifier: 'a', name: 'Mónica', language: 'es-ES' },
    { identifier: 'b', name: 'Paulina', language: 'es-MX' },
    { identifier: 'c', name: 'Samantha', language: 'en-US' }, // filtered out for es
    { identifier: 'd', name: 'Jorge', language: 'es-ES' },
  ];

  test('filters to the requested language and shapes options', () => {
    const out = mapVoices(raw, 'es');
    expect(out.map((v) => v.id).sort()).toEqual(['a', 'b', 'd']);
    const monica = out.find((v) => v.id === 'a')!;
    expect(monica).toMatchObject({ region: 'es-ES', regionLabel: 'Spain', gender: 'female' });
  });

  test('sorts by region, then gender, then name', () => {
    const out = mapVoices(raw, 'es');
    // es-ES before es-MX; within es-ES, "female" sorts before "male" alphabetically,
    // so Mónica (a) precedes Jorge (d), then es-MX Paulina (b).
    expect(out.map((v) => v.id)).toEqual(['a', 'd', 'b']);
  });

  test('returns an empty list when no voices match (e.g. Bengali)', () => {
    expect(mapVoices(raw, 'bn')).toEqual([]);
  });
});
