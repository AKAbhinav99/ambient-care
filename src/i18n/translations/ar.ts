/**
 * Arabic (ar) catalog — right-to-left.
 *
 * AI-generated translation, pending native-speaker/professional review before a
 * production release. Typed `: Messages`, so it stays complete and in sync with
 * the English source of truth.
 */

import type { Messages } from '../types';

export const ar: Messages = {
  common: {
    done: 'تم',
    close: 'إغلاق',
    cancel: 'إلغاء',
    back: 'رجوع',
  },

  nav: {
    talk: 'تحدّث معي',
    connect: 'اتصال',
    settings: 'الإعدادات',
    emergencyCard: 'بطاقة الطوارئ',
    language: 'اللغة',
    voice: 'الصوت',
  },

  role: {
    brand: 'Ambient Care',
    headline: 'رفقة هادئة\nتتكلّم\nفقط عند الحاجة.',
    sub: 'مساعد هادئ على هاتف أو جهاز لوحي إضافي، ونافذة صغيرة في جيبك للعائلة التي تحبّهم.',
    whichIsThis: 'أيّهما هذا؟',
    homeDevice: 'هذا هو جهاز المنزل',
    homeDeviceSub: 'ضعه على الطاولة لأمّك أو أبيك',
    caregiver: 'أنا مقدّم الرعاية',
    caregiverSub: 'اطمئنّ على من تحب من هاتفك الخاص',
    foot: 'يمكنك تبديل الدور في أي وقت من القائمة. لا تتم مشاركة أي شيء دون اقتران.',
  },

  home: {
    greeting: (name, part) => {
      const g = part === 'morning' ? 'صباح الخير' : part === 'afternoon' ? 'نهارك سعيد' : 'مساء الخير';
      return `${g}، ${name}`;
    },
    thankYou: 'شكرًا',
    scanLabel: 'امسح دوائي',
    scanSub: 'وجّه الكاميرا نحو العلبة',
    talkLabel: 'تحدّث معي',
    talkSub: 'اطلب أدويتك، أو الاتصال بالعائلة',
    emergencyLabel: 'بطاقة الطوارئ',
    emergencySub: 'أدويتك وجهات اتصالك لمن يساعدك',
    listening: (name) => `أنا أستمع، أحافظ على سلامة ${name}`,
    demoLevel: 'مستوى تجريبي',
    listeningOff: 'الاستماع للأمان متوقّف — اضغط لتشغيله',
    notConnected: 'لم يتم الاتصال بالعائلة بعد — اضغط للاتصال',
  },

  dose: {
    title: 'حان وقت دوائك',
    taken: 'لقد تناولته',
    notNow: 'ليس الآن',
    markAria: (friendly) => `وضع علامة على ${friendly} كمتناوَل`,
  },

  talk: {
    intro: 'اضغط ما تريد، أو اكتب بالأسفل. أنا أستمع.',
    prompt: 'ماذا تريد؟',
    distressTitle: 'لا أشعر أنني بخير',
    distressDesc: (family) => `يُبلغ ${family} فورًا`,
    callTitle: (family) => `اتصل بـ ${family}`,
    callDesc: 'تواصل مع عائلتك الآن',
    medsTitle: 'ما الحبوب التي أتناولها؟',
    medsDesc: 'سأقرأ قائمتك بصوت عالٍ',
    checkTitle: 'هل تناولت حبوبي؟',
    checkDesc: 'سأتحقق مما تناولته اليوم',
    placeholder: 'أو اكتب ما تريد قوله…',
    say: 'قل',
    note: 'في Expo Go يحل هذا محل التحويل المستمر من الكلام إلى نص، والذي يتطلّب نسخة تطوير مخصّصة. أما تمييز النيّة فهو حقيقي.',
  },

  scan: {
    takeNow: (dosage) => `تناول ${dosage} الآن`,
    notRecognizedTitle: 'همم، لا أتعرّف على هذا',
    notOnList: 'ليس في قائمتك',
    tellFamily: (family) => `أبلغ ${family}`,
    scanAnother: 'امسح آخر',
    whichHolding: 'أيّها تحمل بيدك؟',
    noMedsOnFile: 'لا توجد أدوية مسجّلة بعد.',
    backToCamera: 'العودة إلى الكاميرا',
    preparingCamera: 'جارٍ تجهيز الكاميرا…',
    cameraNeededTitle: 'يلزم الوصول إلى الكاميرا',
    cameraNeededBody:
      'لقراءة علبة دوائك، يحتاج هذا الجهاز إلى استخدام الكاميرا — لفترة وجيزة وفقط عند الضغط على المسح. لا يتم حفظ أي صور.',
    allowCamera: 'السماح بالكاميرا',
    pickFromList: 'اختر من قائمتي بدلًا من ذلك',
    pointAtBarcode: 'وجّه نحو الرمز الشريطي على العلبة',
    cantScan: 'لا يمكن المسح؟ اختر من القائمة',
  },

  settings: {
    title: 'الإعدادات',
    alwaysOnTitle: 'وضع التشغيل الدائم',
    alwaysOnDesc:
      'أبقِ هذا التطبيق في المقدّمة كي يعتني بك. يمكنك دائمًا تركه لاستخدام تطبيقات أخرى — لا شيء مقفل.',
    listenTitle: 'استمع من أجل سلامتي',
    listenDesc:
      'يستمع هذا الجهاز للسقوط والضيق والصمت غير المعتاد. تُحلَّل الأصوات هنا على الجهاز نفسه — لا يُسجَّل أو يُرسَل أي شيء إلى أي مكان.',
    orangeDotTitle: 'حول النقطة البرتقالية',
    orangeDotText:
      'عندما ترى نقطة برتقالية صغيرة أعلى الشاشة، فهذا يعني فقط أن الجهاز يستمع من أجل سلامتك. هذا أمر جيد — إنه يعتني بك.',
    askFamilySetup: 'اطلب من عائلتك إكمال إعداد ملفك.',
    connectFamily: 'الاتصال بالعائلة',
    languageVoice: 'اللغة والصوت',
    easyReadTitle: 'خط سهل القراءة',
    easyReadDesc:
      'التبديل إلى خط أوضح وأكثر تباعدًا يجده كثير من المصابين بعُسر القراءة أسهل في القراءة.',
    colorTitle: 'نمط الألوان',
    colorDesc: 'اضبط ألوان الحالة لتبقى سهلة التمييز مع عمى الألوان.',
    colorNormal: 'قياسي',
    colorRedGreen: 'مناسب للأحمر والأخضر',
    colorBlueYellow: 'مناسب للأزرق والأصفر',
    switchRoleTitle: 'تبديل دور الجهاز؟',
    switchRoleBody: 'سيعيدك هذا إلى الشاشة الأولى.',
    switchBtn: 'تبديل',
    switchRoleLink: 'تبديل الدور / البدء من جديد',
  },

  codeEntry: {
    title: 'أدخل الرمز',
    sub: 'أعدّت عائلتك رمزًا لهذا الجهاز. اكتبه للبدء.',
    placeholder: 'ABC123',
    connect: 'اتصال',
    connecting: 'جارٍ الاتصال…',
    invalid: 'الرمز غير مطابق. يرجى التحقق والمحاولة مرة أخرى.',
    back: 'رجوع',
  },

  pairing: {
    title: 'اتصل بعائلتك',
    sub: 'في تطبيق أحد أفراد عائلتك، يمكنهم كتابة هذا الرمز للاتصال بهذا الجهاز.',
    yourCode: 'رمزك',
    connectedTo: (rel) => `أنت متصل بـ ${rel}`,
    markConnected: 'وضع علامة كمتصل',
    markConnectedSub: 'لهذا الجهاز التجريبي',
    askFamilyFirst:
      'اطلب من عائلتك فتح تطبيقهم وإضافتك أولًا. بعد ذلك سيظهر رمز هنا للاتصال.',
  },

  emergency: {
    badge: 'بطاقة طبية للطوارئ',
    age: (n) => `العمر ${n}`,
    bloodType: (t) => `فصيلة الدم ${t}`,
    allergies: 'الحساسية',
    noneRecorded: 'لا شيء مسجّل',
    conditions: 'الحالات المرضية',
    currentMeds: 'الأدوية الحالية',
    critical: 'حرِج',
    emergencyContacts: 'جهات اتصال الطوارئ',
    call: 'اتصال',
    careTeam: 'فريق الرعاية',
    notes: 'ملاحظات',
    shareCard: 'مشاركة هذه البطاقة',
    noProfile: 'لا يوجد ملف بعد. يمكن لمقدّم الرعاية إعداده أولًا.',
  },

  language: {
    title: 'اللغة',
    sub: 'اختر لغة هذا الجهاز.',
  },

  voicePicker: {
    title: 'الصوت',
    sub: 'اختر شكل الصوت، ثم اضغط للاستماع.',
    accent: 'اللكنة',
    male: 'ذكر',
    female: 'أنثى',
    other: 'أخرى',
    speed: 'سرعة التحدّث',
    slow: 'أبطأ',
    normal: 'عادية',
    selected: 'مُختار',
    preview: 'استماع',
    noVoiceTitle: 'لا يوجد صوت مثبّت',
    noVoiceBody: (language) =>
      `جهازك لا يحتوي بعد على صوت للّغة ${language}. النص مترجَم بالكامل. يمكنك إضافة صوت من إعدادات المحتوى المنطوق في جهازك.`,
    moreVoices: 'يمكن إضافة أصوات أخرى من إعدادات iOS ‹ إمكانية الوصول ‹ المحتوى المنطوق ‹ الأصوات.',
  },

  notif: {
    doseTitle: (friendly) => `حان وقت ${friendly}`,
    doseBody: (dosage) => `${dosage}. اضغط الشاشة الرئيسية لوضع علامة كمتناوَل.`,
  },

  spoken: {
    thankYou: 'شكرًا. أنا أحبّك أيضًا.',
    voicePreview: 'مرحبًا. أنا هنا معك.',

    distress: (family) =>
      `لقد أبلغت ${family} فورًا. من فضلك اجلس وابقَ مكانك — المساعدة في الطريق.`,
    calling: (family) => `حسنًا، أنا أتصل بـ ${family} الآن.`,
    noMeds: 'لا توجد أدوية في قائمتك بعد. اطلب من عائلتك إضافتها.',
    medsIntro: (list) => `هذه أدويتك. ${list}.`,
    medItem: (name, dosage, when) => `${name}، ${dosage}، ${when}`,
    noneScheduledToday: 'ليس لديك أدوية مجدوَلة اليوم.',
    allCaughtUp: (list) => `نعم — أنت على اطّلاع كامل. لقد تناولت ${list} اليوم. أحسنت.`,
    alreadyTaken: (list) => `لقد تناولت بالفعل ${list}.`,
    notTakenYet: 'لم تتناول أي دواء بعد اليوم.',
    stillComing: (list) => `ما زال قادمًا: ${list}.`,
    mayHaveMissed: (list) =>
      `يبدو أنك ربما فوّتّ ${list}. لا بأس — لقد أبلغت عائلتك.`,

    scanConfirm: (friendly, dosage) => `هذا ${friendly}. تناول ${dosage} الآن.`,
    scanMismatch: (family) => `هذا لا يطابق أي شيء في قائمتك. هل تريد أن أُبلغ ${family}؟`,
    scanAlerted: (family) => `حسنًا، لقد أبلغت ${family}.`,

    markedTaken: (friendly) => `جيد. لقد وضعت علامة على ${friendly} كمتناوَل.`,

    schedule: {
      morning: 'في الصباح',
      midday: 'في منتصف اليوم',
      evening: 'في المساء',
      bedtime: 'في المساء قبل النوم',
      asNeeded: 'عند الحاجة',
    },

    smalltalk: [
      'أنا هنا معك. هل تحتاج شيئًا؟',
      'هذا جميل. أنا أستمع إن احتجت أي شيء.',
      'أنا أراقب الأمور من أجلك. يمكنك دائمًا أن تطلب مني أدويتك، أو الاتصال بعائلتك.',
    ],

    joinList: (names) => {
      if (names.length === 0) return '';
      if (names.length === 1) return names[0];
      if (names.length === 2) return `${names[0]} و${names[1]}`;
      return `${names.slice(0, -1).join('، ')} و${names[names.length - 1]}`;
    },
  },
};
