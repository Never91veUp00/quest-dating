// ─── Quest Themes Configuration ──────────────────────────────
// Каждая тема определяет: цвета, шрифты, язык интерфейса,
// фоновую анимацию, декоративные элементы

export const THEMES = {

  // ══════════════════════════════════════════════════════════════
  // 🕵️ ДЕТЕКТИВ — noir, печатная машинка, дождь
  // ══════════════════════════════════════════════════════════════
  detective: {
    id: 'detective',
    label: 'Детектив',
    icon: '🕵️',

    // Цвета
    accent:     '#e8c547',   // желтоватый янтарь (как фонарь под дождём)
    accentDim:  '#9a7f1a',
    bg:         '#0a0a0a',
    bg2:        '#111111',
    surface:    '#161616',
    border:     'rgba(232,197,71,0.12)',
    text:       '#c8b89a',
    dim:        '#5a4e3a',

    baseBg:     '#0a0a0a',
    baseTone:   'dark',
    showTimer:  false,

    // Шрифты
    fonts: {
      display: "'Courier Prime', 'Courier New', monospace",
      body:    "'Courier Prime', 'Courier New', monospace",
      googleFonts: 'Courier+Prime:wght@400;700'
    },

    // Язык UI
    copy: {
      eyebrow:       'СЕКРЕТНОЕ ДЕЛО',
      startBtn:      'ОТКРЫТЬ ДЕЛО',
      taskDone:      'Задокументировано',
      hintBtn:       '🔍 Запросить справку (-10 очков)',
      photoZone:     'Сфотографировать улику',
      finishEyebrow: 'ДЕЛО ЗАКРЫТО',
      shareBtn:      'Передать в архив 📋',
      blockPrefix:   'Улика',
      pointsLabel:   'очков',
    },

    // Фоновая анимация
    bg_animation: 'rain',     // капли дождя

    // Декор на сплэш-экране
    splash_decor: ['🔍', '📋', '🗂️', '💡', '🔦'],

    // Оверлей текстуры
    overlay: 'grain',         // зернистость плёнки
  },

  // ══════════════════════════════════════════════════════════════
  // ❤️ РОМАНТИК — тёплый, лепестки, рукопись
  // ══════════════════════════════════════════════════════════════
  romantic: {
    id: 'romantic',
    label: 'Романтик',
    icon: '❤️',

    accent:     '#e8839a',   // тёплый розово-золотой
    accentDim:  '#8b3a52',
    bg:         '#0e0407',   // очень глубокий бордо
    bg2:        '#160a0e',
    surface:    '#1f0f17',
    border:     'rgba(232,131,154,0.18)',
    text:       '#f5ccd8',
    dim:        '#6b3050',

    baseBg:     '#0f0608',
    baseTone:   'dark',
    showTimer:  false,

    fonts: {
      display: "'Dancing Script', cursive",
      body:    "'Lato', sans-serif",
      googleFonts: 'Dancing+Script:wght@400;700&family=Lato:wght@300;400;700'
    },

    copy: {
      eyebrow:       'Персональный сюрприз',
      startBtn:      'Открыть ❤️',
      taskDone:      'Выполнено с любовью',
      hintBtn:       '✨ Маленькая подсказка (-10 очков)',
      photoZone:     'Сделать памятное фото',
      finishEyebrow: 'Ты справилась!',
      shareBtn:      'Поделиться моментом 💌',
      blockPrefix:   'Сюрприз',
      pointsLabel:   'сердечек',
    },

    bg_animation: 'petals',   // летящие лепестки

    splash_decor: ['🌹', '💌', '✨', '🌸', '💫'],

    overlay: 'soft_glow',     // мягкое свечение
  },

  // ══════════════════════════════════════════════════════════════
  // 🔮 МИСТИКА — готика, туман, звёзды
  // ══════════════════════════════════════════════════════════════
  mystery: {
    id: 'mystery',
    label: 'Мистика',
    icon: '🔮',

    accent:     '#a78bfa',
    accentDim:  '#5b21b6',
    bg:         '#060412',
    bg2:        '#0c0820',
    surface:    '#130d2a',
    border:     'rgba(167,139,250,0.15)',
    text:       '#d4c8f0',
    dim:        '#4c3d7a',

    baseBg:     '#060412',
    baseTone:   'dark',
    showTimer:  false,

    fonts: {
      display: "'Cinzel', serif",
      body:    "'Cinzel', serif",
      googleFonts: 'Cinzel:wght@400;700;900'
    },

    copy: {
      eyebrow:       'ПРОРОЧЕСТВО',
      startBtn:      'Войти в круг',
      taskDone:      'Тайна раскрыта',
      hintBtn:       '🌙 Знак свыше (-10 очков)',
      photoZone:     'Запечатлеть знамение',
      finishEyebrow: 'ПРОРОЧЕСТВО ИСПОЛНЕНО',
      shareBtn:      'Поведать миру 🌙',
      blockPrefix:   'Тайна',
      pointsLabel:   'силы',
    },

    bg_animation: 'stars',    // плывущие звёзды и туман

    splash_decor: ['🌙', '⭐', '🔮', '✦', '🌌'],

    overlay: 'fog',           // туман
  },

  // ══════════════════════════════════════════════════════════════
  // 🗺️ ИСКАТЕЛЬ КЛАДА — карта, золото, приключение
  // ══════════════════════════════════════════════════════════════
  treasure: {
    id: 'treasure',
    label: 'Искатель клада',
    icon: '🗺️',

    accent:     '#f5a623',   // золото
    accentDim:  '#8a5a00',
    bg:         '#0d0a05',
    bg2:        '#150f07',
    surface:    '#1e1509',
    border:     'rgba(245,166,35,0.15)',
    text:       '#e8d5a3',
    dim:        '#5c3d0a',

    baseBg:     '#0d0a05',
    baseTone:   'dark',
    showTimer:  false,

    fonts: {
      display: "'Pirata One', cursive",
      body:    "'Crimson Text', serif",
      googleFonts: 'Pirata+One&family=Crimson+Text:wght@400;600'
    },

    copy: {
      eyebrow:       'КАРТА СОКРОВИЩ',
      startBtn:      'Отправиться в путь 🗺️',
      taskDone:      'Метка найдена!',
      hintBtn:       '🧭 Подсказка штурмана (-10 очков)',
      photoZone:     'Сфотографировать находку',
      finishEyebrow: 'КЛАД НАЙДЕН!',
      shareBtn:      'Поделиться добычей ⚓',
      blockPrefix:   'Метка',
      pointsLabel:   'дублонов',
    },

    bg_animation: 'particles',  // золотые частицы/монеты

    splash_decor: ['🗺️', '⚓', '💰', '🧭', '☠️'],

    overlay: 'grain',
  },



  // ══════════════════════════════════════════════════════════════
  // 💍 ПРЕДЛОЖЕНИЕ — бриллианты, золото, шампанское
  // ══════════════════════════════════════════════════════════════
  proposal: {
    id: 'proposal',
    label: 'Предложение',
    icon: '💍',

    accent:     '#d4af37',   // золото
    accentDim:  '#8b6914',
    bg:         '#080508',
    bg2:        '#100d14',
    surface:    '#18121e',
    border:     'rgba(212,175,55,0.2)',
    text:       '#f0e6d3',
    dim:        '#5a4020',

    baseBg:     '#080508',
    baseTone:   'dark',
    showTimer:  false,

    fonts: {
      display: "'Cormorant Garamond', serif",
      body:    "'Lato', sans-serif",
      googleFonts: 'Cormorant+Garamond:wght@300;400;600;700&family=Lato:wght@300;400'
    },

    copy: {
      eyebrow:       'Особый вечер',
      startBtn:      'Начать ✨',
      taskDone:      'Шаг сделан',
      hintBtn:       '💌 Подсказка (-10 очков)',
      photoZone:     'Сохранить момент',
      finishEyebrow: 'Этот момент — навсегда',
      shareBtn:      'Поделиться 💍',
      blockPrefix:   'Момент',
      pointsLabel:   'искр',
    },

    bg_animation: 'rings',   // кольца + блики

    splash_decor: ['💍', '✨', '🥂', '💎', '🌹'],

    overlay: 'soft_glow',
  },
  city: {
    id: 'city',
    label: 'Город',
    icon: '🏙️',

    accent:     '#00f5c4',
    accentDim:  '#00826a',
    bg:         '#060810',
    bg2:        '#0d1117',
    surface:    '#111822',
    border:     'rgba(0,245,196,0.12)',
    text:       '#c8d6ef',
    dim:        '#2a4a42',

    baseBg:     '#060810',
    baseTone:   'dark',
    showTimer:  false,

    fonts: {
      display: "'Orbitron', monospace",
      body:    "'Rajdhani', sans-serif",
      googleFonts: 'Orbitron:wght@400;700;900&family=Rajdhani:wght@400;500;600;700'
    },

    copy: {
      eyebrow:       'ЗАДАНИЕ ПОЛУЧЕНО',
      startBtn:      'НАЧАТЬ МИССИЮ',
      taskDone:      'Выполнено',
      hintBtn:       '⚡ Подсказка (-10 очков)',
      photoZone:     'Сфотографировать точку',
      finishEyebrow: 'МИССИЯ ВЫПОЛНЕНА',
      shareBtn:      'Поделиться результатом 📤',
      blockPrefix:   'Точка',
      pointsLabel:   'очков',
    },

    bg_animation: 'grid',     // анимированная сетка (текущий стиль)

    splash_decor: ['📍', '⚡', '🎯', '🏙️', '🔋'],

    overlay: 'scanlines',     // CRT-эффект
  },
}

export const getTheme = (id) => THEMES[id] || THEMES.city

// CSS-переменные из темы — вставляем в :root компонента
export const themeToCssVars = (theme) => ({
  '--accent':      theme.accent,
  '--accent-dim':  theme.accentDim,
  '--bg':          theme.bg,
  '--bg2':         theme.bg2,
  '--surf':        theme.surface,
  '--bord':        theme.border,
  '--text':        theme.text,
  '--dim':         theme.dim,
  '--font-d':      theme.fonts.display,
  '--font-b':      theme.fonts.body,
  '--base-bg':     theme.baseBg    ?? theme.bg,
  '--base-tone':   theme.baseTone  ?? 'dark',
})