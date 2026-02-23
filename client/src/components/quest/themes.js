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

    accent:     '#f472b6',
    accentDim:  '#9d174d',
    bg:         '#0f0608',
    bg2:        '#160b10',
    surface:    '#1e0f16',
    border:     'rgba(244,114,182,0.15)',
    text:       '#f9d0e0',
    dim:        '#6b3050',

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
  // 🏙️ ГОРОД — неон, киберпанк, сетка
  // ══════════════════════════════════════════════════════════════
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
})