# Ambient Care

An ambient care MVP for older adults living independently, built with **Expo + React
Native** and runnable in **Expo Go**. One codebase, two role-based surfaces:

- **Home device** (senior) — a calm, oversized interface for a spare phone/tablet on the
  counter. Big clock, a "Scan my medicine" button, a "Talk to me" voice screen, and an
  ambient safety listener.
- **Caregiver** — a low-noise dashboard for the adult child: a single synthesized status,
  last activity, medication setup, pairing, a daily digest, and the activity log.

The product's point is _not_ dumping data. It surfaces something only when it matters, and
the senior side needs no training to use.

## Run it

```bash
npm install
npx expo start
```

Then open **Expo Go** on your iPhone/iPad and scan the QR code (phone and Mac on the same
Wi-Fi). Press `i` for the iOS simulator. It runs immediately — no backend or keys required.

**Try the full loop on one device:**

1. Launch → choose **I'm the caregiver** → tap _load demo data_ (adds "Rose" + 3 meds).
2. Add your own medication and give it a real barcode to scan later, then **Send a hello**.
3. Top-right **Switch** → choose **This is the home device**. You'll see Rose's hello read
   aloud. Try **Scan my medicine** and **Talk to me → "I don't feel good"**.
4. **Switch** back to the caregiver — every scan, phrase, and sound is in the activity log,
   and the status badge reflects it.

## What's real in Expo Go vs. what's stubbed (and why)

The original spec targets native Swift + Apple frameworks. Expo Go can't load custom native
modules and can't record audio continuously in the background, so a few pieces are honest,
clearly-marked stand-ins. Everything downstream of them is real, so swapping the source later
needs no rework.

| Capability | In this build | Production path |
|---|---|---|
| Two surfaces, role login, dashboard, med setup, pairing, digest, log | ✅ Real | — |
| Text-to-speech responses | ✅ Real (`expo-speech`) | — |
| Medicine scan — **barcode** match | ✅ Real (`expo-camera`) | — |
| Medicine scan — **OCR** of a label | ⚠️ Manual-pick fallback | Dev build w/ ML Kit, or native Vision |
| Voice intents (distress / call / meds) | ✅ Real NLU; tap or type input | Always-listening STT needs a dev build (`expo-speech-recognition`) or native Speech |
| Ambient monitor: mic permission, live level, loud-spike → event, activity heartbeat | ✅ Real foreground (`expo-audio`) | Native **Sound Analysis** classifier |
| Continuous **background** listening | ❌ Not possible in Expo Go | Dev build w/ `UIBackgroundModes:["audio"]` (already declared in `app.json`) |
| Alerts + daily digest notifications | ✅ Real **local** notifications | Remote **APNs** push from the backend |
| Cross-device sync | Local store (single device) | Supabase realtime — see below |

## Optional: real backend (Supabase)

1. Create a free project at <https://supabase.com>.
2. Run [`supabase/schema.sql`](supabase/schema.sql) in the SQL editor.
3. Create `.env` in the project root:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
   ```
4. `npx expo start -c`. Events now insert into `care_events`; the dashboard footer shows
   "Connected". Point the dashboard read path at a realtime subscription to finish the loop.

## Architecture

```
App.tsx                     role gate + navigation (hydrates persisted store first)
src/
  theme/tokens.ts           design tokens (warm-paper palette, senior type scale)
  types.ts                  domain models
  lib/
    store.ts                Zustand + AsyncStorage; computeStatus() = the synthesized signal
    supabase.ts             backend seam (no-op until configured)
    notifications.ts        local alerts + daily digest + digest copy
    speech.ts               warm TTS wrapper
    intents.ts              voice intent matching (real NLU layer)
    medMatch.ts             scan → medication matching
    time.ts                 friendly time formatting
  hooks/useAmbientMonitor.ts  foreground mic level → thresholds → events
  components/               UI primitives + LogRow
  screens/senior/*          SeniorHome, Scan, Voice, Pairing, Settings
  screens/caregiver/*       Dashboard, LovedOne, Medications, DailyLog
  navigation/*              per-role native stacks
```

## Design & privacy notes

- **Never locked in.** Always-on vs. Normal mode is a setup choice; the app is never a kiosk
  the senior can't leave.
- **Bias to under-alerting.** A loud sound is a "check-in", not an emergency, during MVP.
- **Consent is explicit.** Ambient monitoring is an opt-in toggle with plain-language copy,
  and the senior settings screen explains the iOS orange mic dot rather than hiding it.
- **Camera is narrow.** Used only for the brief medicine scan — no always-on room camera.
