/**
 * Mandarin Chinese (zh, Simplified) catalog.
 *
 * AI-generated translation, pending native-speaker/professional review before a
 * production release. Typed `: Messages`, so it stays complete and in sync with
 * the English source of truth.
 */

import type { Messages } from '../types';

export const zh: Messages = {
  common: {
    done: '完成',
    close: '关闭',
    cancel: '取消',
    back: '返回',
  },

  nav: {
    talk: '和我说话',
    connect: '连接',
    settings: '设置',
    emergencyCard: '急救卡',
    language: '语言',
    voice: '语音',
    chat: '消息',
  },

  role: {
    brand: 'Ambient Care',
    headline: '安静的陪伴，\n只在需要时\n才开口。',
    sub: '一位安静的助手，放在备用手机或平板上；也是你口袋里的一扇小窗，连着爱他们的家人。',
    whichIsThis: '这是哪一个？',
    homeDevice: '这是家里的设备',
    homeDeviceSub: '放在台面上，给爸爸或妈妈用',
    caregiver: '我是照护者',
    caregiverSub: '用我自己的手机关心我的家人',
    foot: '你可以随时从菜单切换角色。未配对不会分享任何内容。',
  },

  home: {
    greeting: (name, part) => {
      const g = part === 'morning' ? '早上好' : part === 'afternoon' ? '下午好' : '晚上好';
      return `${g}，${name}`;
    },
    thankYou: '谢谢',
    scanLabel: '扫描我的药',
    scanSub: '把相机对准药瓶',
    talkLabel: '和我说话',
    talkSub: '让我读药单，或给家人打电话',
    emergencyLabel: '急救卡',
    emergencySub: '你的药物和联系人，供帮助你的人查看',
    messagesLabel: '消息',
    messagesSub: '在这里给家人发消息',
    listening: (name) => `我在听着，守护着${name}`,
    demoLevel: '演示音量',
    listeningOff: '安全聆听已关闭——点按开启',
    notConnected: '还没和家人连接——点按连接',
  },

  dose: {
    title: '该吃药了',
    taken: '我吃过了',
    notNow: '暂时不',
    markAria: (friendly) => `将${friendly}标记为已服用`,
  },

  talk: {
    intro: '点一下你想做的，或在下面输入。我在听。',
    prompt: '你想做什么？',
    distressTitle: '我不舒服',
    distressDesc: (family) => `立即通知${family}`,
    callTitle: (family) => `打电话给${family}`,
    callDesc: '现在联系你的家人',
    medsTitle: '我要吃哪些药？',
    medsDesc: '我会大声读出你的药单',
    checkTitle: '我吃过药了吗？',
    checkDesc: '我来查查你今天吃了什么',
    placeholder: '或输入你想说的话……',
    say: '说',
    note: '在 Expo Go 中，这里代替持续聆听的语音转文字功能，该功能需要自定义开发版本。意图识别是真实可用的。',
  },

  scan: {
    takeNow: (dosage) => `现在服用${dosage}`,
    notRecognizedTitle: '嗯，我不认识这个',
    notOnList: '它不在你的药单上',
    tellFamily: (family) => `告诉${family}`,
    scanAnother: '再扫一个',
    whichHolding: '你手里拿的是哪一种？',
    noMedsOnFile: '还没有登记任何药物。',
    backToCamera: '返回相机',
    preparingCamera: '正在准备相机……',
    cameraNeededTitle: '需要使用相机',
    cameraNeededBody:
      '为了识别你的药瓶，这台设备需要使用相机——只在你点按扫描时短暂使用。不会保存任何照片。',
    allowCamera: '允许使用相机',
    pickFromList: '改从我的药单里选',
    pointAtBarcode: '对准药瓶上的条形码',
    cantScan: '扫不上？从药单里选',
  },

  settings: {
    title: '设置',
    alwaysOnTitle: '常亮模式',
    alwaysOnDesc:
      '让这个应用保持在前台，好照看你。你随时可以退出去用别的应用——什么都没有锁住。',
    listenTitle: '为我的安全聆听',
    listenDesc:
      '这台设备会聆听跌倒、呼救和异常的安静。声音就在这台设备上分析——不会录制，也不会发送到任何地方。',
    orangeDotTitle: '关于橙色小圆点',
    orangeDotText:
      '当你在屏幕顶部看到一个橙色小圆点时，它只是表示设备正在为你的安全而聆听。这是件好事——它在守护着你。',
    askFamilySetup: '请家人帮你把资料设置完成。',
    connectFamily: '连接家人',
    languageVoice: '语言与语音',
    easyReadTitle: '易读字体',
    easyReadDesc: '切换到更清晰、字距更宽的字体，许多有阅读障碍的人会觉得更容易阅读。',
    colorTitle: '颜色样式',
    colorDesc: '调整状态颜色，让色盲人士也能轻松区分。',
    colorNormal: '标准',
    colorRedGreen: '红绿色盲友好',
    colorBlueYellow: '蓝黄色盲友好',
    switchRoleTitle: '切换设备角色？',
    switchRoleBody: '这将返回第一个屏幕。',
    switchBtn: '切换',
    switchRoleLink: '切换角色／重新开始',
  },

  codeEntry: {
    title: '输入你的代码',
    sub: '你的家人为这台设备设置了一个代码。输入它即可开始。',
    placeholder: 'ABC123',
    connect: '连接',
    connecting: '连接中…',
    invalid: '代码不匹配。请检查后重试。',
    back: '返回',
  },

  pairing: {
    title: '连接你的家人',
    sub: '在家人的应用里，他们可以输入这个代码来连接这台设备。',
    yourCode: '你的代码',
    connectedTo: (rel) => `你已和${rel}连接`,
    markConnected: '标记为已连接',
    markConnectedSub: '用于此演示设备',
    askFamilyFirst: '请家人先打开他们的应用把你添加进去。然后这里会出现一个用于连接的代码。',
  },

  emergency: {
    badge: '急救医疗卡',
    age: (n) => `${n}岁`,
    bloodType: (t) => `血型 ${t}`,
    allergies: '过敏',
    noneRecorded: '没有记录',
    conditions: '基础疾病',
    currentMeds: '正在服用的药物',
    critical: '关键',
    emergencyContacts: '紧急联系人',
    call: '拨打',
    careTeam: '医护团队',
    notes: '备注',
    shareCard: '分享这张卡',
    noProfile: '还没有资料。可以先让照护者设置。',
  },

  language: {
    title: '语言',
    sub: '选择这台设备的语言。',
  },

  voicePicker: {
    title: '语音',
    sub: '选择语音的声音，然后点按试听。',
    accent: '口音',
    male: '男声',
    female: '女声',
    other: '其他',
    speed: '说话速度',
    slow: '更慢',
    normal: '正常',
    selected: '已选择',
    preview: '试听',
    noVoiceTitle: '未安装语音',
    noVoiceBody: (language) =>
      `你的设备还没有${language}的语音。文字已完全翻译。你可以在设备的“朗读内容”设置里添加语音。`,
    moreVoices: '可在 iOS 设置 › 辅助功能 › 朗读内容 › 语音 中添加更多语音。',
  },

  chat: {
    placeholder: '输入消息…',
    send: '发送',
    emptyTitle: '还没有消息',
    emptyBody: '在下面发送第一条消息。',
    quickLoveToo: '我也爱你 ❤️',
    quickOkay: '我很好',
    quickCallMe: '给我打电话',
  },

  notif: {
    doseTitle: (friendly) => `该吃${friendly}了`,
    doseBody: (dosage) => `${dosage}。点按主屏幕把它标记为已服用。`,
  },

  spoken: {
    thankYou: '谢谢。我也爱你。',
    voicePreview: '你好。我就在你身边。',

    distress: (family) => `我已经立即通知了${family}。请坐下，待在原地——帮助马上就到。`,
    calling: (family) => `好的，我现在就给${family}打电话。`,
    noMeds: '你的药单上还没有药。请家人帮你添加。',
    medsIntro: (list) => `这是你的药。${list}。`,
    medItem: (name, dosage, when) => `${name}，${dosage}，${when}`,
    noneScheduledToday: '你今天没有需要按时服用的药。',
    allCaughtUp: (list) => `是的，你都跟上了。今天你已经服用了${list}。做得很好。`,
    alreadyTaken: (list) => `你已经服用了${list}。`,
    notTakenYet: '你今天还没有吃任何药。',
    stillComing: (list) => `还有：${list}。`,
    mayHaveMissed: (list) => `看起来你可能漏服了${list}。没关系——我已经通知了你的家人。`,

    scanConfirm: (friendly, dosage) => `这是${friendly}。现在服用${dosage}。`,
    scanMismatch: (family) => `这和你药单上的都不匹配。要我告诉${family}吗？`,
    scanAlerted: (family) => `好的，我已经通知了${family}。`,

    markedTaken: (friendly) => `好的。我已把${friendly}标记为已服用。`,

    schedule: {
      morning: '早上',
      midday: '中午',
      evening: '晚上',
      bedtime: '晚上睡前',
      asNeeded: '需要时',
    },

    smalltalk: [
      '我就在你身边。有什么需要吗？',
      '真好。你需要什么我都在听。',
      '我在替你照看着。你随时可以让我读药单，或给家人打电话。',
    ],

    joinList: (names) => {
      if (names.length === 0) return '';
      if (names.length === 1) return names[0];
      if (names.length === 2) return `${names[0]}和${names[1]}`;
      return `${names.slice(0, -1).join('、')}和${names[names.length - 1]}`;
    },
  },
};
