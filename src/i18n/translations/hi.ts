/**
 * Hindi (hi, Devanagari) catalog.
 *
 * AI-generated translation, pending native-speaker/professional review before a
 * production release. Typed `: Messages`, so it stays complete and in sync with
 * the English source of truth.
 */

import type { Messages } from '../types';

export const hi: Messages = {
  common: {
    done: 'हो गया',
    close: 'बंद करें',
    cancel: 'रद्द करें',
    back: 'वापस',
  },

  nav: {
    talk: 'मुझसे बात करें',
    connect: 'जोड़ें',
    settings: 'सेटिंग्स',
    emergencyCard: 'आपातकालीन कार्ड',
    language: 'भाषा',
    voice: 'आवाज़',
  },

  role: {
    brand: 'Ambient Care',
    headline: 'शांत साथ,\nजो बोलता है\nसिर्फ़ ज़रूरत पर।',
    sub: 'एक अतिरिक्त फ़ोन या टैबलेट पर एक शांत सहायक, और आपकी जेब में एक छोटी खिड़की उस परिवार के लिए जो उन्हें प्यार करता है।',
    whichIsThis: 'यह कौन-सा है?',
    homeDevice: 'यह घर का उपकरण है',
    homeDeviceSub: 'माँ या पिता के लिए इसे मेज़ पर रखें',
    caregiver: 'मैं देखभाल करने वाला हूँ',
    caregiverSub: 'अपने फ़ोन से अपने प्रियजन का ध्यान रखें',
    foot: 'आप मेन्यू से कभी भी भूमिका बदल सकते हैं। बिना जोड़े कुछ भी साझा नहीं होता।',
  },

  home: {
    greeting: (name, part) => {
      const g = part === 'morning' ? 'सुप्रभात' : part === 'afternoon' ? 'नमस्कार' : 'शुभ संध्या';
      return `${g}, ${name}`;
    },
    thankYou: 'धन्यवाद',
    scanLabel: 'मेरी दवा स्कैन करें',
    scanSub: 'कैमरा बोतल पर लगाएँ',
    talkLabel: 'मुझसे बात करें',
    talkSub: 'अपनी दवाइयाँ पूछें, या परिवार को कॉल करें',
    emergencyLabel: 'आपातकालीन कार्ड',
    emergencySub: 'मदद करने वालों के लिए आपकी दवाइयाँ और संपर्क',
    listening: (name) => `मैं सुन रहा हूँ, ${name} का ध्यान रख रहा हूँ`,
    demoLevel: 'डेमो स्तर',
    listeningOff: 'सुरक्षा श्रवण बंद है — चालू करने के लिए टैप करें',
    notConnected: 'अभी परिवार से नहीं जुड़ा — जोड़ने के लिए टैप करें',
  },

  dose: {
    title: 'आपकी दवा का समय',
    taken: 'मैंने ले ली',
    notNow: 'अभी नहीं',
    markAria: (friendly) => `${friendly} को ली गई के रूप में चिह्नित करें`,
  },

  talk: {
    intro: 'जो चाहें उस पर टैप करें, या नीचे टाइप करें। मैं सुन रहा हूँ।',
    prompt: 'आप क्या चाहेंगे?',
    distressTitle: 'मुझे अच्छा नहीं लग रहा',
    distressDesc: (family) => `${family} को तुरंत बताता है`,
    callTitle: (family) => `${family} को कॉल करें`,
    callDesc: 'अभी अपने परिवार से संपर्क करें',
    medsTitle: 'मुझे कौन-सी गोलियाँ लेनी हैं?',
    medsDesc: 'मैं आपकी सूची ज़ोर से पढ़ूँगा',
    checkTitle: 'क्या मैंने अपनी गोलियाँ ली?',
    checkDesc: 'मैं देखूँगा कि आपने आज क्या लिया',
    placeholder: 'या जो कहना है वह टाइप करें…',
    say: 'कहें',
    note: 'Expo Go में यह लगातार सुनने वाले वॉइस-टू-टेक्स्ट की जगह लेता है, जिसके लिए एक कस्टम डेव बिल्ड चाहिए। इरादा पहचानना असली है।',
  },

  scan: {
    takeNow: (dosage) => `अभी ${dosage} लें`,
    notRecognizedTitle: 'हम्म, मैं इसे नहीं पहचानता',
    notOnList: 'यह आपकी सूची में नहीं है',
    tellFamily: (family) => `${family} को बताएँ`,
    scanAnother: 'दूसरा स्कैन करें',
    whichHolding: 'आपके हाथ में कौन-सी है?',
    noMedsOnFile: 'अभी कोई दवा दर्ज नहीं है।',
    backToCamera: 'कैमरे पर वापस',
    preparingCamera: 'कैमरा तैयार हो रहा है…',
    cameraNeededTitle: 'कैमरे की अनुमति चाहिए',
    cameraNeededBody:
      'आपकी दवा की बोतल पढ़ने के लिए इस उपकरण को कैमरे का उपयोग करना होगा — थोड़ी देर के लिए और सिर्फ़ तब जब आप स्कैन टैप करें। कोई फ़ोटो सहेजी नहीं जाती।',
    allowCamera: 'कैमरे की अनुमति दें',
    pickFromList: 'इसके बजाय अपनी सूची से चुनें',
    pointAtBarcode: 'बोतल पर बने बारकोड पर लगाएँ',
    cantScan: 'स्कैन नहीं हो रहा? सूची से चुनें',
  },

  settings: {
    title: 'सेटिंग्स',
    alwaysOnTitle: 'हमेशा-चालू मोड',
    alwaysOnDesc:
      'इस ऐप को सामने रखें ताकि यह आपका ध्यान रख सके। आप दूसरी ऐप्स इस्तेमाल करने के लिए इसे कभी भी छोड़ सकते हैं — कुछ भी लॉक नहीं है।',
    listenTitle: 'मेरी सुरक्षा के लिए सुनें',
    listenDesc:
      'यह उपकरण गिरने, परेशानी और असामान्य ख़ामोशी को सुनता है। आवाज़ें यहीं इसी उपकरण पर जाँची जाती हैं — कुछ भी रिकॉर्ड या कहीं नहीं भेजा जाता।',
    orangeDotTitle: 'नारंगी बिंदु के बारे में',
    orangeDotText:
      'जब आप स्क्रीन के ऊपर एक छोटा नारंगी बिंदु देखें, तो इसका मतलब सिर्फ़ यह है कि उपकरण आपकी सुरक्षा के लिए सुन रहा है। यह अच्छी बात है — यह आपका ध्यान रख रहा है।',
    askFamilySetup: 'अपने परिवार से कहें कि वे आपकी प्रोफ़ाइल पूरी कर दें।',
    connectFamily: 'परिवार से जुड़ें',
    languageVoice: 'भाषा और आवाज़',
    easyReadTitle: 'आसान पढ़ने वाला फ़ॉन्ट',
    easyReadDesc:
      'एक साफ़ और अधिक दूरी वाले फ़ॉन्ट पर स्विच करें, जिसे डिस्लेक्सिया वाले कई लोग पढ़ने में आसान पाते हैं।',
    colorTitle: 'रंग शैली',
    colorDesc: 'स्थिति के रंगों को ऐसे समायोजित करें कि रंग-अंधता में भी उन्हें आसानी से पहचाना जा सके।',
    colorNormal: 'मानक',
    colorRedGreen: 'लाल–हरा अनुकूल',
    colorBlueYellow: 'नीला–पीला अनुकूल',
    switchRoleTitle: 'उपकरण की भूमिका बदलें?',
    switchRoleBody: 'इससे पहली स्क्रीन पर वापस चले जाएँगे।',
    switchBtn: 'बदलें',
    switchRoleLink: 'भूमिका बदलें / फिर से शुरू करें',
  },

  pairing: {
    title: 'अपने परिवार से जुड़ें',
    sub: 'आपके परिवार वाले अपनी ऐप में यह कोड टाइप करके इस उपकरण से जुड़ सकते हैं।',
    yourCode: 'आपका कोड',
    connectedTo: (rel) => `आप ${rel} से जुड़े हैं`,
    markConnected: 'जुड़ा हुआ चिह्नित करें',
    markConnectedSub: 'इस डेमो उपकरण के लिए',
    askFamilyFirst:
      'अपने परिवार से कहें कि वे पहले अपनी ऐप खोलकर आपको जोड़ें। फिर यहाँ जुड़ने के लिए एक कोड दिखेगा।',
  },

  emergency: {
    badge: 'आपातकालीन मेडिकल कार्ड',
    age: (n) => `उम्र ${n}`,
    bloodType: (t) => `रक्त समूह ${t}`,
    allergies: 'एलर्जी',
    noneRecorded: 'कुछ दर्ज नहीं',
    conditions: 'रोग',
    currentMeds: 'वर्तमान दवाइयाँ',
    critical: 'ज़रूरी',
    emergencyContacts: 'आपातकालीन संपर्क',
    call: 'कॉल',
    careTeam: 'देखभाल टीम',
    notes: 'टिप्पणियाँ',
    shareCard: 'यह कार्ड साझा करें',
    noProfile: 'अभी कोई प्रोफ़ाइल नहीं। देखभाल करने वाला पहले इसे सेट कर सकता है।',
  },

  language: {
    title: 'भाषा',
    sub: 'इस उपकरण की भाषा चुनें।',
  },

  voicePicker: {
    title: 'आवाज़',
    sub: 'चुनें कि आवाज़ कैसी लगे, फिर सुनने के लिए टैप करें।',
    accent: 'लहजा',
    male: 'पुरुष',
    female: 'महिला',
    other: 'अन्य',
    speed: 'बोलने की गति',
    slow: 'धीमी',
    normal: 'सामान्य',
    selected: 'चयनित',
    preview: 'सुनें',
    noVoiceTitle: 'कोई आवाज़ इंस्टॉल नहीं',
    noVoiceBody: (language) =>
      `आपके उपकरण में अभी ${language} के लिए कोई आवाज़ नहीं है। टेक्स्ट पूरी तरह अनुवादित है। आप अपने उपकरण की “Spoken Content” सेटिंग में आवाज़ जोड़ सकते हैं।`,
    moreVoices: 'और आवाज़ें iOS सेटिंग्स › Accessibility › Spoken Content › Voices में जोड़ी जा सकती हैं।',
  },

  notif: {
    doseTitle: (friendly) => `${friendly} का समय`,
    doseBody: (dosage) => `${dosage}। इसे ली गई चिह्नित करने के लिए होम स्क्रीन टैप करें।`,
  },

  spoken: {
    thankYou: 'धन्यवाद। मैं भी आपसे प्यार करता हूँ।',
    voicePreview: 'नमस्ते। मैं आपके साथ ही हूँ।',

    distress: (family) =>
      `मैंने ${family} को तुरंत बता दिया है। कृपया बैठ जाइए और वहीं रहिए — मदद आ रही है।`,
    calling: (family) => `ठीक है, मैं अभी ${family} को कॉल कर रहा हूँ।`,
    noMeds: 'आपकी सूची में अभी कोई दवा नहीं है। अपने परिवार से उन्हें जोड़ने को कहें।',
    medsIntro: (list) => `यह रही आपकी दवा। ${list}।`,
    medItem: (name, dosage, when) => `${name}, ${dosage}, ${when}`,
    noneScheduledToday: 'आज आपकी कोई निर्धारित दवा नहीं है।',
    allCaughtUp: (list) => `हाँ — आप पूरी तरह अपडेट हैं। आज आपने ${list} ले ली है। बहुत बढ़िया।`,
    alreadyTaken: (list) => `आप पहले ही ${list} ले चुके हैं।`,
    notTakenYet: 'आपने आज अभी तक कोई दवा नहीं ली है।',
    stillComing: (list) => `अभी बाकी है: ${list}।`,
    mayHaveMissed: (list) =>
      `लगता है आपने ${list} छोड़ दी हो सकती है। कोई बात नहीं — मैंने आपके परिवार को बता दिया है।`,

    scanConfirm: (friendly, dosage) => `यह ${friendly} है। अभी ${dosage} लें।`,
    scanMismatch: (family) => `यह आपकी सूची में किसी से मेल नहीं खाती। क्या मैं ${family} को बता दूँ?`,
    scanAlerted: (family) => `ठीक है, मैंने ${family} को बता दिया है।`,

    markedTaken: (friendly) => `बढ़िया। मैंने ${friendly} को ली गई चिह्नित कर दिया है।`,

    schedule: {
      morning: 'सुबह',
      midday: 'दोपहर में',
      evening: 'शाम को',
      bedtime: 'रात को सोते समय',
      asNeeded: 'ज़रूरत होने पर',
    },

    smalltalk: [
      'मैं आपके साथ ही हूँ। आपको कुछ चाहिए?',
      'अच्छा है। अगर कुछ चाहिए तो मैं सुन रहा हूँ।',
      'मैं आपके लिए ध्यान रख रहा हूँ। आप कभी भी मुझसे अपनी दवाइयाँ या परिवार को कॉल करने को कह सकते हैं।',
    ],

    joinList: (names) => {
      if (names.length === 0) return '';
      if (names.length === 1) return names[0];
      if (names.length === 2) return `${names[0]} और ${names[1]}`;
      return `${names.slice(0, -1).join(', ')} और ${names[names.length - 1]}`;
    },
  },
};
