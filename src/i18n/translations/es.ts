/**
 * Spanish (es) catalog.
 *
 * AI-generated translation, pending native-speaker/professional review before a
 * production release. Typed `: Messages`, so it stays complete and in sync with
 * the English source of truth.
 */

import type { Messages } from '../types';

export const es: Messages = {
  common: {
    done: 'Listo',
    close: 'Cerrar',
    cancel: 'Cancelar',
    back: 'Atrás',
  },

  nav: {
    talk: 'Háblame',
    connect: 'Conectar',
    settings: 'Ajustes',
    emergencyCard: 'Tarjeta de emergencia',
    language: 'Idioma',
    voice: 'Voz',
  },

  role: {
    brand: 'Ambient Care',
    headline: 'Compañía tranquila\nque habla\nsolo cuando importa.',
    sub: 'Un ayudante tranquilo en un teléfono o tableta de repuesto, y una pequeña ventana en tu bolsillo para la familia que los quiere.',
    whichIsThis: '¿Cuál es este?',
    homeDevice: 'Este es el dispositivo del hogar',
    homeDeviceSub: 'Colócalo en la encimera para mamá o papá',
    caregiver: 'Soy el cuidador',
    caregiverSub: 'Cuido a mi ser querido desde mi propio teléfono',
    foot: 'Puedes cambiar de rol en cualquier momento desde el menú. No se comparte nada sin vincular.',
  },

  home: {
    greeting: (name, part) => {
      const g = part === 'morning' ? 'Buenos días' : part === 'afternoon' ? 'Buenas tardes' : 'Buenas noches';
      return `${g}, ${name}`;
    },
    thankYou: 'Gracias',
    scanLabel: 'Escanear mi medicina',
    scanSub: 'Apunta la cámara al frasco',
    talkLabel: 'Háblame',
    talkSub: 'Pide tus pastillas o llamar a la familia',
    emergencyLabel: 'Tarjeta de emergencia',
    emergencySub: 'Tus medicinas y contactos para quien te ayude',
    listening: (name) => `Estoy escuchando, cuidando a ${name}`,
    demoLevel: 'nivel de demostración',
    listeningOff: 'La escucha de seguridad está apagada: toca para activarla',
    notConnected: 'Aún no conectado con la familia: toca para conectar',
  },

  dose: {
    title: 'Hora de tu medicina',
    taken: 'Ya la tomé',
    notNow: 'Ahora no',
    markAria: (friendly) => `Marcar ${friendly} como tomada`,
  },

  talk: {
    intro: 'Toca lo que quieras o escribe abajo. Te escucho.',
    prompt: '¿Qué te gustaría?',
    distressTitle: 'No me siento bien',
    distressDesc: (family) => `Avisa a ${family} de inmediato`,
    callTitle: (family) => `Llamar a ${family}`,
    callDesc: 'Comunícate con tu familia ahora',
    medsTitle: '¿Qué pastillas tomo?',
    medsDesc: 'Te leeré tu lista en voz alta',
    checkTitle: '¿Ya tomé mis pastillas?',
    checkDesc: 'Revisaré lo que has tomado hoy',
    placeholder: 'O escribe lo que dirías…',
    say: 'Decir',
    note: 'En Expo Go esto sustituye al dictado por voz continuo, que requiere una compilación de desarrollo. La detección de intención sí es real.',
  },

  scan: {
    takeNow: (dosage) => `Toma ${dosage} ahora`,
    notRecognizedTitle: 'Mmm, no reconozco esto',
    notOnList: 'No está en tu lista',
    tellFamily: (family) => `Avisar a ${family}`,
    scanAnother: 'Escanear otra',
    whichHolding: '¿Cuál tienes en la mano?',
    noMedsOnFile: 'Aún no hay medicinas registradas.',
    backToCamera: 'Volver a la cámara',
    preparingCamera: 'Preparando la cámara…',
    cameraNeededTitle: 'Se necesita acceso a la cámara',
    cameraNeededBody:
      'Para leer tu frasco de medicina, este dispositivo necesita usar la cámara, brevemente y solo cuando tocas escanear. No se guardan fotos.',
    allowCamera: 'Permitir cámara',
    pickFromList: 'Elegir de mi lista',
    pointAtBarcode: 'Apunta al código de barras del frasco',
    cantScan: '¿No puedes escanear? Elige de la lista',
  },

  settings: {
    title: 'Ajustes',
    alwaysOnTitle: 'Modo siempre activo',
    alwaysOnDesc:
      'Mantén esta app al frente para que pueda cuidarte. Siempre puedes salir para usar otras apps: nada está bloqueado.',
    listenTitle: 'Escuchar por mi seguridad',
    listenDesc:
      'Este dispositivo escucha caídas, angustia y silencios inusuales. Los sonidos se analizan aquí mismo en el dispositivo: nada se graba ni se envía a ningún lugar.',
    orangeDotTitle: 'Sobre el punto naranja',
    orangeDotText:
      'Cuando veas un pequeño punto naranja en la parte superior de la pantalla, solo significa que el dispositivo está escuchando por tu seguridad. Eso es bueno: te está cuidando.',
    askFamilySetup: 'Pídele a tu familia que termine de configurar tu perfil.',
    connectFamily: 'Conectar con la familia',
    languageVoice: 'Idioma y voz',
    easyReadTitle: 'Fuente de lectura fácil',
    easyReadDesc:
      'Cambia a una fuente más clara y espaciada que muchas personas con dislexia leen con mayor facilidad.',
    colorTitle: 'Estilo de color',
    colorDesc: 'Ajusta los colores de estado para que sean fáciles de distinguir con daltonismo.',
    colorNormal: 'Estándar',
    colorRedGreen: 'Apto para rojo-verde',
    colorBlueYellow: 'Apto para azul-amarillo',
    switchRoleTitle: '¿Cambiar el rol del dispositivo?',
    switchRoleBody: 'Esto vuelve a la primera pantalla.',
    switchBtn: 'Cambiar',
    switchRoleLink: 'Cambiar de rol / empezar de nuevo',
  },

  pairing: {
    title: 'Conecta con tu familia',
    sub: 'En la app de tu familiar, pueden escribir este código para conectarse a este dispositivo.',
    yourCode: 'Tu código',
    connectedTo: (rel) => `Estás conectado con ${rel}`,
    markConnected: 'Marcar como conectado',
    markConnectedSub: 'Para este dispositivo de demostración',
    askFamilyFirst:
      'Pídele a tu familia que abra su app y te agregue primero. Luego aparecerá aquí un código para conectar.',
  },

  emergency: {
    badge: 'TARJETA MÉDICA DE EMERGENCIA',
    age: (n) => `${n} años`,
    bloodType: (t) => `Grupo sanguíneo ${t}`,
    allergies: 'Alergias',
    noneRecorded: 'Nada registrado',
    conditions: 'Condiciones',
    currentMeds: 'Medicinas actuales',
    critical: 'crítica',
    emergencyContacts: 'Contactos de emergencia',
    call: 'Llamar',
    careTeam: 'Equipo de cuidado',
    notes: 'Notas',
    shareCard: 'Compartir esta tarjeta',
    noProfile: 'Aún no hay perfil. Un cuidador puede configurarlo primero.',
  },

  language: {
    title: 'Idioma',
    sub: 'Elige el idioma de este dispositivo.',
  },

  voicePicker: {
    title: 'Voz',
    sub: 'Elige cómo suena la voz y toca para escucharla.',
    accent: 'Acento',
    male: 'Masculina',
    female: 'Femenina',
    other: 'Otra',
    speed: 'Velocidad al hablar',
    slow: 'Más lenta',
    normal: 'Normal',
    selected: 'Seleccionada',
    preview: 'Escuchar',
    noVoiceTitle: 'No hay voz instalada',
    noVoiceBody: (language) =>
      `Tu dispositivo aún no tiene una voz para ${language}. El texto está totalmente traducido. Puedes agregar una voz en los ajustes de Contenido Hablado de tu dispositivo.`,
    moreVoices: 'Puedes agregar más voces en Ajustes de iOS › Accesibilidad › Contenido hablado › Voces.',
  },

  notif: {
    doseTitle: (friendly) => `Hora de ${friendly}`,
    doseBody: (dosage) => `${dosage}. Toca la pantalla de inicio para marcarla como tomada.`,
  },

  spoken: {
    thankYou: 'Gracias. Yo también te quiero.',
    voicePreview: 'Hola. Estoy aquí contigo.',

    distress: (family) =>
      `Ya avisé a ${family} de inmediato. Por favor, siéntate y quédate donde estás: la ayuda viene en camino.`,
    calling: (family) => `De acuerdo, estoy llamando a ${family} ahora.`,
    noMeds: 'Aún no tengo medicinas en tu lista. Pídele a tu familia que las agregue.',
    medsIntro: (list) => `Aquí está tu medicina. ${list}.`,
    medItem: (name, dosage, when) => `${name}, ${dosage}, ${when}`,
    noneScheduledToday: 'No tienes medicinas programadas para hoy.',
    allCaughtUp: (list) => `Sí, estás al día. Hoy has tomado ${list}. Bien hecho.`,
    alreadyTaken: (list) => `Ya has tomado ${list}.`,
    notTakenYet: 'Aún no has tomado ninguna medicina hoy.',
    stillComing: (list) => `Todavía falta: ${list}.`,
    mayHaveMissed: (list) =>
      `Parece que podrías haber olvidado ${list}. No pasa nada: ya le avisé a tu familia.`,

    scanConfirm: (friendly, dosage) => `Esta es ${friendly}. Toma ${dosage} ahora.`,
    scanMismatch: (family) => `Esto no coincide con nada de tu lista. ¿Quieres que le avise a ${family}?`,
    scanAlerted: (family) => `De acuerdo, ya le avisé a ${family}.`,

    markedTaken: (friendly) => `Bien. Marqué ${friendly} como tomada.`,

    schedule: {
      morning: 'por la mañana',
      midday: 'al mediodía',
      evening: 'por la tarde',
      bedtime: 'por la noche, al acostarte',
      asNeeded: 'según sea necesario',
    },

    smalltalk: [
      'Estoy aquí contigo. ¿Necesitas algo?',
      'Qué bien. Te escucho si necesitas algo.',
      'Estoy pendiente de ti. Siempre puedes pedirme tus pastillas o llamar a tu familia.',
    ],

    joinList: (names) => {
      if (names.length === 0) return '';
      if (names.length === 1) return names[0];
      if (names.length === 2) return `${names[0]} y ${names[1]}`;
      return `${names.slice(0, -1).join(', ')} y ${names[names.length - 1]}`;
    },
  },
};
