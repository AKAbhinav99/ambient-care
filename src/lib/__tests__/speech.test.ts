// Mock the native speech module and the store so say() is testable in node.
// Names are `mock`-prefixed so Jest allows them inside the hoisted factories.
const mockSpeak = jest.fn();
const mockStop = jest.fn();
let mockLovedOne: Record<string, unknown> | null = null;

jest.mock('expo-speech', () => ({
  stop: (...args: unknown[]) => mockStop(...args),
  speak: (...args: unknown[]) => mockSpeak(...args),
}));

jest.mock('../store', () => ({
  useStore: { getState: () => ({ lovedOne: mockLovedOne }) },
}));

import { say } from '../speech';

type SpeakOptions = { language?: string; voice?: string; rate?: number; pitch?: number };

function lastOptions(): SpeakOptions {
  return mockSpeak.mock.calls[mockSpeak.mock.calls.length - 1][1] as SpeakOptions;
}

beforeEach(() => {
  mockSpeak.mockClear();
  mockStop.mockClear();
  mockLovedOne = null;
});

describe('say', () => {
  test('stops any current utterance, then speaks the given text', () => {
    say('hello');
    expect(mockStop).toHaveBeenCalledTimes(1);
    expect(mockSpeak).toHaveBeenCalledTimes(1);
    expect(mockSpeak.mock.calls[0][0]).toBe('hello');
  });

  test('defaults to US English at the standard rate with no voice', () => {
    say('hello');
    const opts = lastOptions();
    expect(opts.language).toBe('en-US');
    expect(opts.rate).toBe(0.92);
    expect(opts.voice).toBeUndefined();
  });

  test("uses the loved one's language default when no regional voice is chosen", () => {
    mockLovedOne = { language: 'es' };
    say('hola');
    expect(lastOptions().language).toBe('es-ES');
  });

  test('uses the chosen regional voice, id, and rate override', () => {
    mockLovedOne = { language: 'es', voiceRegion: 'es-MX', voiceId: 'com.apple.voice.x', speechRate: 0.75 };
    say('hola');
    const opts = lastOptions();
    expect(opts.language).toBe('es-MX');
    expect(opts.voice).toBe('com.apple.voice.x');
    expect(opts.rate).toBe(0.75);
  });
});
