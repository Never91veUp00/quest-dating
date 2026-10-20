// ─── Quest Themes Configuration ──────────────────────────────
// Каждая тема определяет: цвета, шрифты, язык интерфейса,
// фоновую анимацию, декоративные элементы

export const THEMES = {

  // ══════════════════════════════════════════════════════════════
  // ДЕТЕКТИВ — noir, печатная машинка, дождь
  // ══════════════════════════════════════════════════════════════
  detective: {
    id: 'detective',
    label: 'Детектив',

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

    // Моушн-ролик «Как это работает» (tools/reels/detective.html → record.mjs)
    reel: { src: '/reels/detective.mp4', poster: '/reels/detective.jpg' },

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
      pointsForms:   ['очко', 'очка', 'очков'],
    },

    // Фоновая анимация
    bg_animation: 'rain',     // капли дождя


    // Оверлей текстуры
    overlay: null,            // мир дела — плоская печать, без зерна
  },

  // ══════════════════════════════════════════════════════════════
  // РОМАНТИК — переписка: конверты, лента, почтовый штемпель
  // ══════════════════════════════════════════════════════════════
  romantic: {
    id: 'romantic',
    label: 'Романтик',

    // Цвета — шкатулка с письмами: винная подкладка, хлопковая бумага, лента
    accent:     '#d98f8f',
    accentDim:  '#dcbfa6',
    bg:         '#6b2e35',   // подкладка шкатулки
    bg2:        '#55232a',
    surface:    '#7a3a40',
    border:     'rgba(246,235,220,0.22)',
    text:       '#f6ebdc',
    dim:        '#ecdcc8',

    baseBg:     '#6b2e35',
    baseTone:   'dark',
    showTimer:  false,

    // Мир «Ходилки» в обличье переписки: клетки — конверты на ленте,
    // карточка — письмо поверх конверта, пройденное гасит почтовый штемпель
    world: {
      decor:        'letters',
      field:        '#6b2e35',
      fieldInk:     '#f6ebdc',
      fieldInkSoft: '#ecdcc8',
      paper:        '#f8f1e4',   // хлопковая бумага письма
      paperEdge:    '#e2c9ae',   // конверт
      ink:          '#3b1c20',   // винные чернила
      inkSoft:      '#6e4a47',
      plate:        '#f8f1e4',   // конверт лицом вверх
      plateInk:     '#3b1c20',
      done:         '#dcbfa6',   // конверт вскрыт
      back:         '#8c4f52',   // конверт обратной стороной
      chip:         '#d98f8f',   // атласная лента
      rule:         '#3b1c20',
      wrong:        '#a3313a',
      action:       '#3b1c20',
      actionInk:    '#f8f1e4',
      focus:        '#3b1c20',   // лента на бумаге слишком бледна для кольца фокуса
      sealWax:      '#8f2630',   // сургуч на клапане конверта-крышки
      sealDeep:     '#661820',
    },

    // Моушн-ролик «Как это работает» (tools/reels/romantic.html → record.mjs)
    reel: { src: '/reels/romantic.mp4', poster: '/reels/romantic.jpg' },

    // Шрифты
    fonts: {
      display: "'Cormorant Garamond', 'PT Serif', Georgia, serif",
      body:    "'PT Serif', Georgia, serif",
      hand:    "'Bad Script', 'PT Serif', Georgia, cursive",
      // у Cormorant по умолчанию старинные цифры; на поле игры — выровненные
      features: '"lnum"',
      // у Cormorant мелкий глаз: выравниваем высоту строчных по PT Serif
      adjust:   '0.5',
      // кнопки-глаголы набираем полужирным: на солнце тонкая антиква теряется
      displayWeight: 700,
      selfHosted: true,
    },

    copy: {
      eyebrow:       'Персональный сюрприз',
      startBtn:      'Открыть',
      taskDone:      'Выполнено с любовью',
      hintBtn:       'Маленькая подсказка · −10 сердечек',
      photoZone:     'Сделать памятное фото',
      finishEyebrow: 'Ты справилась!',
      shareBtn:      'Поделиться моментом',
      blockPrefix:   'Глава',
      blockForms:    ['глава', 'главы', 'глав'],
      pointsLabel:   'сердечек',
      pointsForms:   ['сердечко', 'сердечка', 'сердечек'],
    },

    bg_animation: null,
    overlay: null,            // мир переписки — плоская печать, без свечения
  },

  // ══════════════════════════════════════════════════════════════
  // МИСТИКА — готика, туман, звёзды
  // ══════════════════════════════════════════════════════════════
  mystery: {
    id: 'mystery',
    label: 'Мистика',

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
      hintBtn:       'Знак свыше · −10 очков',
      photoZone:     'Запечатлеть знамение',
      finishEyebrow: 'ПРОРОЧЕСТВО ИСПОЛНЕНО',
      shareBtn:      'Поведать миру',
      blockPrefix:   'Тайна',
      pointsLabel:   'силы',
      pointsForms:   ['очко силы', 'очка силы', 'очков силы'],
    },

    bg_animation: 'stars',    // плывущие звёзды и туман


    overlay: 'fog',           // туман
  },

  // ══════════════════════════════════════════════════════════════
  // ИСКАТЕЛЬ КЛАДА — карта, золото, приключение
  // ══════════════════════════════════════════════════════════════
  treasure: {
    id: 'treasure',
    label: 'Искатель клада',

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
      startBtn:      'Отправиться в путь',
      taskDone:      'Метка найдена!',
      hintBtn:       'Подсказка штурмана · −10 очков',
      photoZone:     'Сфотографировать находку',
      finishEyebrow: 'КЛАД НАЙДЕН!',
      shareBtn:      'Поделиться добычей',
      blockPrefix:   'Метка',
      pointsLabel:   'дублонов',
      pointsForms:   ['дублон', 'дублона', 'дублонов'],
    },

    bg_animation: 'particles',  // золотые частицы/монеты


    overlay: 'grain',
  },



  // ══════════════════════════════════════════════════════════════
  // ПРЕДЛОЖЕНИЕ — бриллианты, золото, шампанское
  // ══════════════════════════════════════════════════════════════
  proposal: {
    id: 'proposal',
    label: 'Предложение',

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
      startBtn:      'Начать',
      taskDone:      'Шаг сделан',
      hintBtn:       'Подсказка · −10 очков',
      photoZone:     'Сохранить момент',
      finishEyebrow: 'Этот момент — навсегда',
      shareBtn:      'Поделиться',
      blockPrefix:   'Момент',
      pointsLabel:   'искр',
      pointsForms:   ['искра', 'искры', 'искр'],
    },

    bg_animation: 'rings',   // кольца + блики


    overlay: 'soft_glow',
  },
  city: {
    id: 'city',
    label: 'Город',

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
      hintBtn:       'Подсказка · −10 очков',
      photoZone:     'Сфотографировать точку',
      finishEyebrow: 'МИССИЯ ВЫПОЛНЕНА',
      shareBtn:      'Поделиться результатом',
      blockPrefix:   'Точка',
      pointsLabel:   'очков',
      pointsForms:   ['очко', 'очка', 'очков'],
    },

    bg_animation: 'grid',     // анимированная сетка (текущий стиль)


    overlay: 'scanlines',     // CRT-эффект
  },
}

export const getTheme = (id) => THEMES[id] || THEMES.city

// Русское множественное число: 1 сердечко, 2 сердечка, 5 сердечек
export const plural = (n, one, few, many) => {
  const m10 = Math.abs(n) % 10, m100 = Math.abs(n) % 100
  if (m10 === 1 && m100 !== 11) return one
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few
  return many
}

// Очки темы, согласованные с числом
export const pointsWord = (theme, n) => {
  const f = theme.copy?.pointsForms
  return f ? plural(n, ...f) : theme.copy?.pointsLabel ?? 'очков'
}

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
  '--font-h':      theme.fonts.hand     ?? theme.fonts.body,
  '--font-feat':   theme.fonts.features ?? 'normal',
  '--font-adjust': theme.fonts.adjust   ?? 'none',
  '--font-d-wt':   theme.fonts.displayWeight ?? 400,
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
    // фокус и выделение на бумаге: по умолчанию краска фишки
    '--focus':          w.focus        ?? w.chip ?? theme.accent,
    // сургуч: без своего цвета QuestSeal берёт запасной красный
    ...(w.sealWax  && { '--seal-wax':  w.sealWax }),
    ...(w.sealDeep && { '--seal-deep': w.sealDeep }),
  }
}