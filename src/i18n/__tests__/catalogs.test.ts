import { CATALOGS } from '../catalogs';
import { en } from '../translations/en';

type Leaf = 'string' | 'function' | 'array';

/** Collect a flat map of dotted paths → leaf kind. Arrays/functions are leaves. */
function leaves(obj: Record<string, unknown>, prefix = ''): Record<string, Leaf> {
  const out: Record<string, Leaf> = {};
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    const path = prefix ? `${prefix}.${key}` : key;
    if (Array.isArray(value)) out[path] = 'array';
    else if (typeof value === 'function') out[path] = 'function';
    else if (value && typeof value === 'object') Object.assign(out, leaves(value as Record<string, unknown>, path));
    else out[path] = 'string';
  }
  return out;
}

function getPath(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, k) => (acc as Record<string, unknown>)?.[k], obj);
}

const enLeaves = leaves(en as unknown as Record<string, unknown>);
const catalogs = Object.entries(CATALOGS);

describe.each(catalogs)('catalog "%s" completeness', (code, cat) => {
  const catLeaves = leaves(cat as unknown as Record<string, unknown>);

  test('has exactly the English keys, with matching leaf kinds', () => {
    expect(Object.keys(catLeaves).sort()).toEqual(Object.keys(enLeaves).sort());
    for (const [path, kind] of Object.entries(enLeaves)) {
      expect(catLeaves[path]).toBe(kind);
    }
  });

  test('no empty string or array values', () => {
    for (const [path, kind] of Object.entries(catLeaves)) {
      const value = getPath(cat as unknown as Record<string, unknown>, path);
      if (kind === 'string') {
        expect(typeof value).toBe('string');
        expect((value as string).trim().length).toBeGreaterThan(0);
      } else if (kind === 'array') {
        const arr = value as string[];
        expect(arr.length).toBeGreaterThan(0);
        arr.forEach((s) => expect(s.trim().length).toBeGreaterThan(0));
      }
    }
  });
});

describe.each(catalogs)('catalog "%s" interpolation', (code, cat) => {
  test('greeting includes the name', () => {
    expect(cat.home.greeting('Rose', 'morning')).toContain('Rose');
    expect(cat.home.greeting('Rose', 'evening')).toContain('Rose');
  });

  test('medItem and medsIntro are non-empty', () => {
    const item = cat.spoken.medItem('Aspirin', '1 pill', cat.spoken.schedule.morning);
    expect(item.trim().length).toBeGreaterThan(0);
    expect(cat.spoken.medsIntro(item).trim().length).toBeGreaterThan(0);
  });

  test('joinList handles 0, 1, 2, and 3 names', () => {
    expect(cat.spoken.joinList([])).toBe('');
    expect(cat.spoken.joinList(['aspirin'])).toBe('aspirin');
    expect(cat.spoken.joinList(['aspirin', 'metformin']).trim().length).toBeGreaterThan(0);
    expect(cat.spoken.joinList(['a', 'b', 'c'])).toContain('a');
  });

  test('scan + dose spoken lines are non-empty', () => {
    expect(cat.spoken.scanConfirm('your heart medicine', '10mg').trim().length).toBeGreaterThan(0);
    expect(cat.spoken.markedTaken('your heart medicine').trim().length).toBeGreaterThan(0);
    expect(cat.voicePicker.noVoiceBody('বাংলা').trim().length).toBeGreaterThan(0);
  });
});
