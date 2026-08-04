/**
 * Ambient audio monitor — the Expo Go-honest version of Phases 3 & 4.
 *
 * What this is NOT: production sound-event detection. Continuous *background*
 * recording and Apple's Sound Analysis classifier are native-only and cannot run
 * in Expo Go. Doing that for real means the native Swift app, or an Expo dev build
 * with UIBackgroundModes:["audio"] and a config plugin.
 *
 * What this IS: a real, foreground microphone monitor that proves out the whole
 * detection pipeline — mic permission (note the real iOS orange dot), a live audio
 * level, threshold logic that turns a loud spike into a "possible fall" event, and
 * an activity heartbeat that feeds the silence-anomaly rule. Swap the level source
 * for Sound Analysis classifications later and every downstream piece still works.
 *
 * If device metering is unavailable, it falls back to a gentle simulated level so
 * the pipeline and UI are still demonstrable.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  useAudioRecorder,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  RecordingPresets,
} from 'expo-audio';
import { useStore } from '../lib/store';

const POLL_MS = 400;
const LOUD_LEVEL = 0.86; // normalized spike that reads as a crash/fall
const LOUD_DEBOUNCE_MS = 12000; // don't re-alert on the same commotion
const HEARTBEAT_MS = 30000; // refresh "the home is alive" while sound is present

/** Map dBFS (typically -60..0) to a friendly 0..1 level. */
function normalize(dbfs: number | undefined): number | null {
  if (dbfs == null || Number.isNaN(dbfs)) return null;
  const clamped = Math.max(-60, Math.min(0, dbfs));
  return (clamped + 60) / 60;
}

export interface AmbientMonitor {
  running: boolean;
  level: number; // 0..1, smoothed
  permissionDenied: boolean;
  simulated: boolean; // true when we couldn't read real metering
  start: () => Promise<void>;
  stop: () => Promise<void>;
}

export function useAmbientMonitor(): AmbientMonitor {
  const recorder = useAudioRecorder({ ...RecordingPresets.HIGH_QUALITY, isMeteringEnabled: true });
  const logEvent = useStore((s) => s.logEvent);
  const markActivity = useStore((s) => s.markActivity);
  const setAmbientRunning = useStore((s) => s.setAmbientRunning);

  const [running, setRunning] = useState(false);
  const [level, setLevel] = useState(0);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [simulated, setSimulated] = useState(false);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastLoudRef = useRef(0);
  const lastBeatRef = useRef(0);
  const smoothRef = useRef(0);
  const simPhaseRef = useRef(0);

  const tick = useCallback(() => {
    let raw: number | null = null;
    try {
      raw = normalize(recorder.getStatus().metering);
    } catch {
      raw = null;
    }

    let next: number;
    if (raw == null) {
      // Simulated ambient room tone: slow breathing wave + a little noise.
      setSimulated(true);
      simPhaseRef.current += 0.18;
      const wave = 0.28 + 0.12 * Math.sin(simPhaseRef.current);
      next = Math.max(0, Math.min(1, wave + (Math.random() - 0.5) * 0.06));
    } else {
      setSimulated(false);
      next = raw;
    }

    // Exponential smoothing so the meter doesn't jitter.
    smoothRef.current = smoothRef.current * 0.7 + next * 0.3;
    setLevel(smoothRef.current);

    const now = Date.now();

    // Loud spike -> possible fall/crash. Kept at "check-in" severity on purpose:
    // during MVP we bias toward under-alerting (a kitchen is a noisy place).
    if (next > LOUD_LEVEL && now - lastLoudRef.current > LOUD_DEBOUNCE_MS) {
      lastLoudRef.current = now;
      logEvent({
        kind: 'loud_sound',
        severity: 'checkIn',
        title: 'A loud sound was detected',
        detail: 'Could be a dropped object or a fall. Worth a check-in.',
      });
    }

    // Heartbeat: normal sound in the room means someone/something is active.
    if (next > 0.12 && now - lastBeatRef.current > HEARTBEAT_MS) {
      lastBeatRef.current = now;
      markActivity();
    }
  }, [recorder, logEvent, markActivity]);

  const start = useCallback(async () => {
    const perm = await requestRecordingPermissionsAsync();
    if (!perm.granted) {
      setPermissionDenied(true);
      return;
    }
    setPermissionDenied(false);
    try {
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch (err) {
      console.warn('[ambient] could not start recorder, using simulated level:', err);
      setSimulated(true);
    }
    lastBeatRef.current = Date.now();
    markActivity();
    setRunning(true);
    setAmbientRunning(true);
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(tick, POLL_MS);
  }, [recorder, tick, markActivity, setAmbientRunning]);

  const stop = useCallback(async () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    try {
      if (recorder.isRecording) await recorder.stop();
    } catch {
      /* already stopped */
    }
    setRunning(false);
    setLevel(0);
    smoothRef.current = 0;
    setAmbientRunning(false);
  }, [recorder, setAmbientRunning]);

  // Clean up on unmount.
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  return { running, level, permissionDenied, simulated, start, stop };
}
