/**
 * English catalog — the source of truth for the message shape.
 *
 * `type Messages = typeof en` (see ../types) is derived from this object, so every
 * other language file is checked against it at compile time: a missing or
 * misnamed key, or an interpolation function with the wrong signature, fails
 * `tsc`. Interpolated lines are functions so each language keeps its own grammar
 * and word order. Plain strings stay strings.
 *
 * Scope: the senior-facing surface and everything the app speaks aloud. Caregiver
 * screens and clinical interaction copy stay English and live elsewhere.
 */

type Part = 'morning' | 'afternoon' | 'evening';

export const en = {
  common: {
    done: 'Done',
    close: 'Close',
    cancel: 'Cancel',
    back: 'Back',
  },

  nav: {
    talk: 'Talk to me',
    connect: 'Connect',
    settings: 'Settings',
    emergencyCard: 'Emergency card',
    language: 'Language',
    voice: 'Voice',
    chat: 'Messages',
  },

  role: {
    brand: 'Ambient Care',
    headline: 'Quiet company\nthat speaks up\nonly when it matters.',
    sub: 'A calm helper on a spare phone or tablet, and a small window in your pocket for the family who love them.',
    whichIsThis: 'Which one is this?',
    homeDevice: 'This is the home device',
    homeDeviceSub: 'Set it on the counter for Mom or Dad',
    caregiver: "I'm the caregiver",
    caregiverSub: 'Check in on my loved one from my own phone',
    foot: 'You can switch roles anytime from the menu. Nothing is shared without pairing.',
  },

  home: {
    greeting: (name: string, part: Part): string => {
      const g = part === 'morning' ? 'Good morning' : part === 'afternoon' ? 'Good afternoon' : 'Good evening';
      return `${g}, ${name}`;
    },
    thankYou: 'Thank you',
    scanLabel: 'Scan my medicine',
    scanSub: 'Point the camera at the bottle',
    talkLabel: 'Talk to me',
    talkSub: 'Ask for your pills, or to call family',
    emergencyLabel: 'Emergency Card',
    emergencySub: 'Your medicines & contacts for helpers',
    messagesLabel: 'Messages',
    messagesSub: 'Send a text to family, right here',
    listening: (name: string): string => `I'm listening, keeping ${name} safe`,
    demoLevel: 'demo level',
    listeningOff: 'Safety listening is off — tap to turn it on',
    notConnected: 'Not connected to family yet — tap to connect',
  },

  dose: {
    title: 'Time for your medicine',
    taken: 'I took it',
    notNow: 'Not now',
    markAria: (friendly: string): string => `Mark ${friendly} as taken`,
  },

  talk: {
    intro: "Tap what you'd like, or type below. I'm listening.",
    prompt: 'What would you like?',
    distressTitle: "I don't feel good",
    distressDesc: (family: string): string => `Tells ${family} right away`,
    callTitle: (family: string): string => `Call ${family}`,
    callDesc: 'Reach your family now',
    medsTitle: 'What pills do I take?',
    medsDesc: "I'll read your list out loud",
    checkTitle: 'Did I take my pills?',
    checkDesc: "I'll check what you've taken today",
    placeholder: "Or type what you'd say…",
    say: 'Say',
    note: 'In Expo Go this stands in for always-listening speech-to-text, which needs a custom dev build. The intent matching is the real thing.',
  },

  scan: {
    takeNow: (dosage: string): string => `Take ${dosage} now`,
    notRecognizedTitle: "Hmm, I don't recognize this",
    notOnList: "It's not on your list",
    tellFamily: (family: string): string => `Tell ${family}`,
    scanAnother: 'Scan another',
    whichHolding: 'Which one are you holding?',
    noMedsOnFile: 'No medications on file yet.',
    backToCamera: 'Back to camera',
    preparingCamera: 'Preparing camera…',
    cameraNeededTitle: 'Camera access needed',
    cameraNeededBody:
      'To read your medicine bottle, this device needs to use the camera — briefly and only when you tap scan. No photos are saved.',
    allowCamera: 'Allow camera',
    pickFromList: 'Pick from my list instead',
    pointAtBarcode: 'Point at the barcode on the bottle',
    cantScan: "Can't scan? Pick from list",
  },

  settings: {
    title: 'Settings',
    alwaysOnTitle: 'Always-on mode',
    alwaysOnDesc:
      'Keep this app in front so it can watch out for you. You can always leave it to use other apps — nothing is locked.',
    listenTitle: 'Listen for my safety',
    listenDesc:
      'This device listens for falls, distress, and unusual quiet. Sounds are checked right here on the device — nothing is recorded or sent anywhere.',
    orangeDotTitle: 'About the orange dot',
    orangeDotText:
      "When you see a small orange dot at the top of the screen, it just means the device is listening for your safety. That's a good thing — it's watching out for you.",
    askFamilySetup: 'Ask your family to finish setting up your profile.',
    connectFamily: 'Connect to family',
    languageVoice: 'Language & voice',
    easyReadTitle: 'Easy-read font',
    easyReadDesc:
      'Switch to a clearer, more spaced-out font that many people with dyslexia find easier to read.',
    colorTitle: 'Color style',
    colorDesc: 'Adjust the status colors so they stay easy to tell apart with color blindness.',
    colorNormal: 'Standard',
    colorRedGreen: 'Red–green friendly',
    colorBlueYellow: 'Blue–yellow friendly',
    switchRoleTitle: 'Switch device role?',
    switchRoleBody: 'This returns to the first screen.',
    switchBtn: 'Switch',
    switchRoleLink: 'Switch role / start over',
  },

  codeEntry: {
    title: 'Enter your code',
    sub: 'Your family set up a code for this device. Type it in to get started.',
    placeholder: 'ABC123',
    connect: 'Connect',
    connecting: 'Connecting…',
    invalid: "That code didn't match. Please check it and try again.",
    back: 'Go back',
  },

  pairing: {
    title: 'Connect to your family',
    sub: "In your family member's app, they can type this code to connect to this device.",
    yourCode: 'Your code',
    connectedTo: (rel: string): string => `You're connected to ${rel}`,
    markConnected: 'Mark as connected',
    markConnectedSub: 'For this demo device',
    askFamilyFirst:
      'Ask your family to open their app and add you first. Then a code will appear here to connect.',
  },

  emergency: {
    badge: 'EMERGENCY MEDICAL CARD',
    age: (n: number): string => `age ${n}`,
    bloodType: (t: string): string => `Blood type ${t}`,
    allergies: 'Allergies',
    noneRecorded: 'None recorded',
    conditions: 'Conditions',
    currentMeds: 'Current medications',
    critical: 'critical',
    emergencyContacts: 'Emergency contacts',
    call: 'Call',
    careTeam: 'Care team',
    notes: 'Notes',
    shareCard: 'Share this card',
    noProfile: 'No profile yet. A caregiver can set this up first.',
  },

  language: {
    title: 'Language',
    sub: 'Choose the language for this device.',
  },

  voicePicker: {
    title: 'Voice',
    sub: 'Choose how the voice sounds, then tap to hear it.',
    accent: 'Accent',
    male: 'Male',
    female: 'Female',
    other: 'Other',
    speed: 'Speaking speed',
    slow: 'Slower',
    normal: 'Normal',
    selected: 'Selected',
    preview: 'Preview',
    noVoiceTitle: 'No voice installed',
    noVoiceBody: (language: string): string =>
      `Your device doesn't have a spoken voice for ${language} yet. The text is fully translated. You can add a voice in your device's Spoken Content settings.`,
    moreVoices: 'More voices can be added in iOS Settings › Accessibility › Spoken Content › Voices.',
  },

  chat: {
    placeholder: 'Type a message…',
    send: 'Send',
    emptyTitle: 'No messages yet',
    emptyBody: 'Send the first one below.',
    quickLoveToo: 'I love you too ❤️',
    quickOkay: "I'm okay",
    quickCallMe: 'Call me',
  },

  notif: {
    doseTitle: (friendly: string): string => `Time for ${friendly}`,
    doseBody: (dosage: string): string => `${dosage}. Tap the home screen to mark it taken.`,
  },

  /** Everything spoken aloud through expo-speech. */
  spoken: {
    thankYou: 'Thank you. I love you too.',
    voicePreview: "Hello. I'm right here with you.",

    // Talk-screen intent responses
    distress: (family: string): string =>
      `I've let ${family} know right away. Please sit down and stay where you are — help is coming.`,
    calling: (family: string): string => `Okay, I'm calling ${family} for you now.`,
    noMeds: "I don't have any medicines on your list yet. Ask your family to add them.",
    medsIntro: (list: string): string => `Here's your medicine. ${list}.`,
    medItem: (name: string, dosage: string, when: string): string => `${name}, ${dosage}, ${when}`,
    noneScheduledToday: "You don't have any scheduled medicines today.",
    allCaughtUp: (list: string): string =>
      `Yes — you're all caught up. You've taken ${list} today. Nicely done.`,
    alreadyTaken: (list: string): string => `You've already taken ${list}.`,
    notTakenYet: "You haven't taken any medicine yet today.",
    stillComing: (list: string): string => `Still coming up: ${list}.`,
    mayHaveMissed: (list: string): string =>
      `It looks like you may have missed ${list}. That's okay — I've let your family know.`,

    // Scan responses
    scanConfirm: (friendly: string, dosage: string): string => `This is ${friendly}. Take ${dosage} now.`,
    scanMismatch: (family: string): string =>
      `This doesn't match anything on your list. Want me to let ${family} know?`,
    scanAlerted: (family: string): string => `Okay, I've let ${family} know.`,

    // Dose prompt
    markedTaken: (friendly: string): string => `Good. I've marked ${friendly} as taken.`,

    // Schedule phrases used inside medItem (include their own preposition so
    // each language can phrase the timing naturally).
    schedule: {
      morning: 'in the morning',
      midday: 'in the middle of the day',
      evening: 'in the evening',
      bedtime: 'in the evening at bedtime',
      asNeeded: 'as needed',
    },

    smalltalk: [
      "I'm right here with you. Is there anything you need?",
      "That's nice. I'm listening if you need anything.",
      "I'm keeping an eye on things for you. You can always ask me for your pills, or to call your family.",
    ] as string[],

    /** Join friendly dose names into a natural list, with each language's grammar. */
    joinList: (names: string[]): string => {
      if (names.length === 0) return '';
      if (names.length === 1) return names[0];
      if (names.length === 2) return `${names[0]} and ${names[1]}`;
      return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
    },
  },
};
