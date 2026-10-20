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

    // Цвета — доска улик и папка дела: сепия и один красный штамп
    accent:     '#d9c39c',
    accentDim:  '#a88b62',
    bg:         '#5f4f43',   // сукно доски улик
    bg2:        '#4e4037',
    surface:    '#6b5a4c',
    border:     'rgba(241,232,216,0.22)',
    text:       '#f1e8d8',
    dim:        '#e6dccb',

    baseBg:     '#5f4f43',
    baseTone:   'dark',
    showTimer:  false,

    // Мир «Ходилки» в обличье дела: клетки — приколотые заметки,
    // карточка — лист в папке на скотче, фишка — красный штамп
    world: {
      decor:        'casefile',
      field:        '#5f4f43',
      fieldInk:     '#f1e8d8',
      fieldInkSoft: '#e6dccb',
      paper:        '#f4efe4',
      paperEdge:    '#cdb894',   // край папки
      ink:          '#2a211b',
      inkSoft:      '#5a4c40',
      plate:        '#f4efe4',   // свежая заметка
      plateInk:     '#2a211b',
      done:         '#c9ad80',   // крафт: заметка отработана
      back:         '#4e4037',
      chip:         '#9f2b25',   // красный штамп
      rule:         '#2a211b',
      wrong:        '#9f2b25',
      action:       '#2a211b',
      actionInk:    '#f4efe4',
    },

    // Шрифты
    fonts: {
      display: "'Dela Gothic One', 'PT Serif', Georgia, serif",
      body:    "'PT Serif', Georgia, serif",
      // свои файлы: assets/styles/fonts.css + public/fonts (не зависим от сети Google)
      selfHosted: true,
    },

    // Язык UI
    copy: {
      eyebrow:       'СЕКРЕТНОЕ ДЕЛО',
      startBtn:      'ОТКРЫТЬ ДЕЛО',
      taskDone:      'Задокументировано',
      hintBtn:       'Запросить справку · −10 очков',
      photoZone:     'Сфотографировать улику',
      finishEyebrow: 'ДЕЛО ЗАКРЫТО',
      shareBtn:      'Передать в архив',
      blockPrefix:   'Улика',
      pointsLabel:   'очков',
    },

    // Фоновая анимация
    bg_animation: 'rain',     // капли дождя

    // Декор на сплэш-экране
    splash_decor: ['🔍', '📋', '🗂️', '💡', '🔦'],

    // Оверлей текстуры
    overlay: null,            // мир дела — плоская печать, без зерна
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
  ...worldVars(theme),
})

// Токены мира «Ходилки». Темы, у которых ещё нет своего мира,
// получают их из старых токенов и выглядят как раньше по цвету.
// Приглушённый текст: 72% основного цвета, читается на фоне темы
const soft = (ink, ground) => `color-mix(in srgb, ${ink} 72%, ${ground})`

const worldVars = (theme) => {
  const w = theme.world ?? {}
  return {
    '--field':          w.field        ?? theme.bg,
    '--field-ink':      w.fieldInk     ?? theme.text,
    '--field-ink-soft': w.fieldInkSoft ?? soft(theme.text, theme.bg),
    '--paper':          w.paper        ?? theme.surface,
    '--paper-edge':     w.paperEdge    ?? theme.bg2,
    '--ink':            w.ink          ?? theme.text,
    '--ink-soft':       w.inkSoft      ?? soft(theme.text, theme.surface),
    '--plate':          w.plate        ?? theme.accent,
    '--plate-ink':      w.plateInk     ?? theme.bg,
    '--done':           w.done         ?? theme.accentDim,
    '--back':           w.back         ?? theme.bg2,
    '--chip':           w.chip         ?? theme.accent,
    '--rule':           w.rule         ?? theme.border,
    '--wrong':          w.wrong        ?? '#e5534b',
    '--action':         w.action       ?? theme.accent,
    '--action-ink':     w.actionInk    ?? theme.bg,
  }
}