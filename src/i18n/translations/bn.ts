/**
 * Bengali (bn, Bangla) catalog.
 *
 * AI-generated translation, pending native-speaker/professional review before a
 * production release. Typed `: Messages`, so it stays complete and in sync with
 * the English source of truth. Note: iOS may not ship a spoken Bengali voice, so
 * the voice picker degrades gracefully — the text here is always used regardless.
 */

import type { Messages } from '../types';

export const bn: Messages = {
  common: {
    done: 'হয়ে গেছে',
    close: 'বন্ধ করুন',
    cancel: 'বাতিল',
    back: 'পিছনে',
  },

  nav: {
    talk: 'আমার সাথে কথা বলুন',
    connect: 'সংযোগ',
    settings: 'সেটিংস',
    emergencyCard: 'জরুরি কার্ড',
    language: 'ভাষা',
    voice: 'কণ্ঠস্বর',
  },

  role: {
    brand: 'Ambient Care',
    headline: 'শান্ত সঙ্গ,\nযা কথা বলে\nকেবল যখন দরকার।',
    sub: 'একটি বাড়তি ফোন বা ট্যাবলেটে একজন শান্ত সহায়ক, আর আপনার পকেটে একটি ছোট জানালা সেই পরিবারের জন্য যারা তাঁদের ভালোবাসে।',
    whichIsThis: 'এটি কোনটি?',
    homeDevice: 'এটি বাড়ির ডিভাইস',
    homeDeviceSub: 'মা বা বাবার জন্য এটি টেবিলে রাখুন',
    caregiver: 'আমি যত্নকারী',
    caregiverSub: 'নিজের ফোন থেকে প্রিয়জনের খোঁজ নিন',
    foot: 'আপনি মেনু থেকে যেকোনো সময় ভূমিকা পাল্টাতে পারেন। যুক্ত না হলে কিছুই শেয়ার হয় না।',
  },

  home: {
    greeting: (name, part) => {
      const g = part === 'morning' ? 'সুপ্রভাত' : part === 'afternoon' ? 'শুভ অপরাহ্ন' : 'শুভ সন্ধ্যা';
      return `${g}, ${name}`;
    },
    thankYou: 'ধন্যবাদ',
    scanLabel: 'আমার ওষুধ স্ক্যান করুন',
    scanSub: 'ক্যামেরা বোতলের দিকে ধরুন',
    talkLabel: 'আমার সাথে কথা বলুন',
    talkSub: 'আপনার ওষুধ জিজ্ঞেস করুন, বা পরিবারকে ফোন করুন',
    emergencyLabel: 'জরুরি কার্ড',
    emergencySub: 'সাহায্যকারীদের জন্য আপনার ওষুধ ও যোগাযোগ',
    listening: (name) => `আমি শুনছি, ${name}-কে নিরাপদ রাখছি`,
    demoLevel: 'ডেমো স্তর',
    listeningOff: 'নিরাপত্তার জন্য শোনা বন্ধ আছে — চালু করতে ট্যাপ করুন',
    notConnected: 'এখনও পরিবারের সাথে যুক্ত নয় — যুক্ত হতে ট্যাপ করুন',
  },

  dose: {
    title: 'আপনার ওষুধের সময়',
    taken: 'আমি খেয়েছি',
    notNow: 'এখন নয়',
    markAria: (friendly) => `${friendly} খাওয়া হয়েছে হিসেবে চিহ্নিত করুন`,
  },

  talk: {
    intro: 'যা চান তাতে ট্যাপ করুন, বা নিচে লিখুন। আমি শুনছি।',
    prompt: 'আপনি কী চান?',
    distressTitle: 'আমার ভালো লাগছে না',
    distressDesc: (family) => `${family}-কে এখনই জানায়`,
    callTitle: (family) => `${family}-কে ফোন করুন`,
    callDesc: 'এখনই আপনার পরিবারের সাথে যোগাযোগ করুন',
    medsTitle: 'আমি কোন ওষুধ খাই?',
    medsDesc: 'আমি আপনার তালিকা জোরে পড়ব',
    checkTitle: 'আমি কি আমার ওষুধ খেয়েছি?',
    checkDesc: 'আপনি আজ কী খেয়েছেন দেখব',
    placeholder: 'অথবা যা বলবেন তা লিখুন…',
    say: 'বলুন',
    note: 'Expo Go-তে এটি সবসময় শোনার ভয়েস-টু-টেক্সট-এর বদলে কাজ করে, যার জন্য একটি কাস্টম ডেভ বিল্ড দরকার। উদ্দেশ্য শনাক্তকরণটি আসল।',
  },

  scan: {
    takeNow: (dosage) => `এখন ${dosage} নিন`,
    notRecognizedTitle: 'হুম, আমি এটি চিনতে পারছি না',
    notOnList: 'এটি আপনার তালিকায় নেই',
    tellFamily: (family) => `${family}-কে জানান`,
    scanAnother: 'আরেকটি স্ক্যান করুন',
    whichHolding: 'আপনার হাতে কোনটি আছে?',
    noMedsOnFile: 'এখনও কোনো ওষুধ নথিভুক্ত নেই।',
    backToCamera: 'ক্যামেরায় ফিরুন',
    preparingCamera: 'ক্যামেরা প্রস্তুত হচ্ছে…',
    cameraNeededTitle: 'ক্যামেরার অনুমতি দরকার',
    cameraNeededBody:
      'আপনার ওষুধের বোতল পড়তে এই ডিভাইসটির ক্যামেরা ব্যবহার করা দরকার — অল্প সময়ের জন্য এবং শুধু যখন আপনি স্ক্যান ট্যাপ করেন। কোনো ছবি সংরক্ষণ করা হয় না।',
    allowCamera: 'ক্যামেরার অনুমতি দিন',
    pickFromList: 'বরং আমার তালিকা থেকে বেছে নিন',
    pointAtBarcode: 'বোতলের বারকোডের দিকে ধরুন',
    cantScan: 'স্ক্যান করা যাচ্ছে না? তালিকা থেকে বেছে নিন',
  },

  settings: {
    title: 'সেটিংস',
    alwaysOnTitle: 'সবসময়-চালু মোড',
    alwaysOnDesc:
      'এই অ্যাপটি সামনে রাখুন যাতে এটি আপনার খেয়াল রাখতে পারে। অন্য অ্যাপ ব্যবহার করতে আপনি যেকোনো সময় এটি ছেড়ে যেতে পারেন — কিছুই লক করা নেই।',
    listenTitle: 'আমার নিরাপত্তার জন্য শুনুন',
    listenDesc:
      'এই ডিভাইসটি পড়ে যাওয়া, কষ্ট ও অস্বাভাবিক নীরবতা শোনে। শব্দগুলো এই ডিভাইসেই বিশ্লেষণ করা হয় — কিছুই রেকর্ড বা কোথাও পাঠানো হয় না।',
    orangeDotTitle: 'কমলা বিন্দু সম্পর্কে',
    orangeDotText:
      'স্ক্রিনের উপরে যখন একটি ছোট কমলা বিন্দু দেখবেন, তার মানে শুধু এই যে ডিভাইসটি আপনার নিরাপত্তার জন্য শুনছে। এটি ভালো ব্যাপার — এটি আপনার খেয়াল রাখছে।',
    askFamilySetup: 'আপনার পরিবারকে আপনার প্রোফাইল সম্পূর্ণ করতে বলুন।',
    connectFamily: 'পরিবারের সাথে যুক্ত হন',
    languageVoice: 'ভাষা ও কণ্ঠস্বর',
    easyReadTitle: 'সহজপাঠ্য ফন্ট',
    easyReadDesc:
      'আরও স্পষ্ট ও বেশি ফাঁকযুক্ত একটি ফন্টে যান, যা ডিসলেক্সিয়া থাকা অনেকের কাছে পড়তে সহজ মনে হয়।',
    colorTitle: 'রঙের ধরন',
    colorDesc: 'বর্ণান্ধতা থাকলেও যেন সহজে আলাদা করা যায়, সেভাবে স্ট্যাটাসের রং সমন্বয় করুন।',
    colorNormal: 'সাধারণ',
    colorRedGreen: 'লাল–সবুজ উপযোগী',
    colorBlueYellow: 'নীল–হলুদ উপযোগী',
    switchRoleTitle: 'ডিভাইসের ভূমিকা পাল্টাবেন?',
    switchRoleBody: 'এটি প্রথম স্ক্রিনে ফিরিয়ে নেবে।',
    switchBtn: 'পাল্টান',
    switchRoleLink: 'ভূমিকা পাল্টান / আবার শুরু করুন',
  },

  pairing: {
    title: 'আপনার পরিবারের সাথে যুক্ত হন',
    sub: 'আপনার পরিবারের সদস্যের অ্যাপে তাঁরা এই কোডটি টাইপ করে এই ডিভাইসের সাথে যুক্ত হতে পারেন।',
    yourCode: 'আপনার কোড',
    connectedTo: (rel) => `আপনি ${rel}-এর সাথে যুক্ত`,
    markConnected: 'যুক্ত হিসেবে চিহ্নিত করুন',
    markConnectedSub: 'এই ডেমো ডিভাইসের জন্য',
    askFamilyFirst:
      'আপনার পরিবারকে আগে তাঁদের অ্যাপ খুলে আপনাকে যোগ করতে বলুন। এরপর যুক্ত হওয়ার জন্য এখানে একটি কোড দেখা যাবে।',
  },

  emergency: {
    badge: 'জরুরি মেডিকেল কার্ড',
    age: (n) => `বয়স ${n}`,
    bloodType: (t) => `রক্তের গ্রুপ ${t}`,
    allergies: 'অ্যালার্জি',
    noneRecorded: 'কিছু নথিভুক্ত নেই',
    conditions: 'রোগ',
    currentMeds: 'বর্তমান ওষুধ',
    critical: 'জরুরি',
    emergencyContacts: 'জরুরি যোগাযোগ',
    call: 'কল',
    careTeam: 'যত্ন দল',
    notes: 'মন্তব্য',
    shareCard: 'এই কার্ড শেয়ার করুন',
    noProfile: 'এখনও কোনো প্রোফাইল নেই। একজন যত্নকারী আগে এটি সেট করতে পারেন।',
  },

  language: {
    title: 'ভাষা',
    sub: 'এই ডিভাইসের ভাষা বেছে নিন।',
  },

  voicePicker: {
    title: 'কণ্ঠস্বর',
    sub: 'কণ্ঠস্বর কেমন শোনাবে বেছে নিন, তারপর শুনতে ট্যাপ করুন।',
    accent: 'উচ্চারণ',
    male: 'পুরুষ',
    female: 'নারী',
    other: 'অন্যান্য',
    speed: 'কথা বলার গতি',
    slow: 'ধীর',
    normal: 'স্বাভাবিক',
    selected: 'নির্বাচিত',
    preview: 'শুনুন',
    noVoiceTitle: 'কোনো কণ্ঠস্বর ইনস্টল নেই',
    noVoiceBody: (language) =>
      `আপনার ডিভাইসে এখনও ${language}-এর জন্য কোনো কণ্ঠস্বর নেই। লেখাটি পুরোপুরি অনূদিত। আপনি ডিভাইসের Spoken Content সেটিংসে কণ্ঠস্বর যোগ করতে পারেন।`,
    moreVoices: 'আরও কণ্ঠস্বর iOS সেটিংস › Accessibility › Spoken Content › Voices-এ যোগ করা যায়।',
  },

  notif: {
    doseTitle: (friendly) => `${friendly}-এর সময়`,
    doseBody: (dosage) => `${dosage}। খাওয়া হয়েছে চিহ্নিত করতে হোম স্ক্রিনে ট্যাপ করুন।`,
  },

  spoken: {
    thankYou: 'ধন্যবাদ। আমিও আপনাকে ভালোবাসি।',
    voicePreview: 'নমস্কার। আমি আপনার সাথেই আছি।',

    distress: (family) =>
      `আমি ${family}-কে এখনই জানিয়ে দিয়েছি। দয়া করে বসুন এবং যেখানে আছেন সেখানেই থাকুন — সাহায্য আসছে।`,
    calling: (family) => `ঠিক আছে, আমি এখন ${family}-কে ফোন করছি।`,
    noMeds: 'আপনার তালিকায় এখনও কোনো ওষুধ নেই। আপনার পরিবারকে সেগুলো যোগ করতে বলুন।',
    medsIntro: (list) => `এই যে আপনার ওষুধ। ${list}।`,
    medItem: (name, dosage, when) => `${name}, ${dosage}, ${when}`,
    noneScheduledToday: 'আজ আপনার কোনো নির্ধারিত ওষুধ নেই।',
    allCaughtUp: (list) => `হ্যাঁ — আপনি সব খেয়ে ফেলেছেন। আজ আপনি ${list} খেয়েছেন। বেশ ভালো।`,
    alreadyTaken: (list) => `আপনি ইতিমধ্যে ${list} খেয়েছেন।`,
    notTakenYet: 'আপনি আজ এখনও কোনো ওষুধ খাননি।',
    stillComing: (list) => `এখনও বাকি: ${list}।`,
    mayHaveMissed: (list) =>
      `মনে হচ্ছে আপনি ${list} বাদ দিয়ে থাকতে পারেন। ঠিক আছে — আমি আপনার পরিবারকে জানিয়ে দিয়েছি।`,

    scanConfirm: (friendly, dosage) => `এটি ${friendly}। এখন ${dosage} নিন।`,
    scanMismatch: (family) => `এটি আপনার তালিকার কোনো কিছুর সাথে মিলছে না। আমি কি ${family}-কে জানাব?`,
    scanAlerted: (family) => `ঠিক আছে, আমি ${family}-কে জানিয়ে দিয়েছি।`,

    markedTaken: (friendly) => `ভালো। আমি ${friendly} খাওয়া হয়েছে চিহ্নিত করেছি।`,

    schedule: {
      morning: 'সকালে',
      midday: 'দুপুরে',
      evening: 'সন্ধ্যায়',
      bedtime: 'রাতে ঘুমানোর আগে',
      asNeeded: 'প্রয়োজনে',
    },

    smalltalk: [
      'আমি আপনার সাথেই আছি। আপনার কি কিছু দরকার?',
      'বেশ। কিছু দরকার হলে আমি শুনছি।',
      'আমি আপনার জন্য খেয়াল রাখছি। আপনি যেকোনো সময় আমাকে আপনার ওষুধ, বা পরিবারকে ফোন করতে বলতে পারেন।',
    ],

    joinList: (names) => {
      if (names.length === 0) return '';
      if (names.length === 1) return names[0];
      if (names.length === 2) return `${names[0]} ও ${names[1]}`;
      return `${names.slice(0, -1).join(', ')} এবং ${names[names.length - 1]}`;
    },
  },
};
