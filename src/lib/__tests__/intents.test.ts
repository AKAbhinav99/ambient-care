import { matchIntent } from '../intents';

describe('matchIntent', () => {
  test.each<[string, string]>([
    ['did I take my pills?', 'checkMeds'],
    ['have I taken my medicine', 'checkMeds'],
    ['already took my pills today', 'checkMeds'],
    ['what pills do I take', 'meds'],
    ['which medicine is mine', 'meds'],
    ['call my daughter', 'callFamily'],
    ['I need help', 'distress'],
    ["I don't feel good", 'distress'],
    ['nice weather today', 'smalltalk'],
  ])('maps "%s" to %s', (phrase, intent) => {
    expect(matchIntent(phrase)).toBe(intent);
  });

  test('checkMeds is matched before the generic meds query', () => {
    // "did I take my medicine" contains "my medicine" (a meds pattern) but must win as checkMeds
    expect(matchIntent('did I take my medicine')).toBe('checkMeds');
  });
});
