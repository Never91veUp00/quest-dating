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
      introHint:     'Сними нить — и дело твоё',
      startBtn:      'ОТКРЫТЬ ДЕЛО',
      taskDone:      'Задокументировано',
      hintBtn:       'Запросить справку · −10 очков',
      photoZone:     'Сфотографировать улику',
      finishEyebrow: 'ДЕЛО ЗАКРЫТО',
      shareBtn:      'Передать в архив',
      blockPrefix:   'Улика',
      blockForms:    ['улика', 'улики', 'улик'],
      finishBtn:     'Закрыть дело',
      messageLabel:  'Личное послание',
      splashNote:    'Карточки дела открываются по очереди. Подглядывать вперёд не получится — так задумано.',
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
      introHint:     'Сломай сургуч — письмо внутри',
      // порядок «доска»: записки на столе, финал — связка последних писем
      hubLead:       'Записки разложены по столу — читай в любом порядке. Последнее письмо откроется, когда прочитаешь остальные.',
      hubDone:       'Все записки прочитаны. Последнее письмо ждёт.',
      finishBtn:     'Завершить',
      messageLabel:  'Слова для тебя',
      splashNote:    'Письма приходят по очереди. Подглядывать вперёд не получится — так задумано.',
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

    // Цвета — стол гадалки: зелёно-чёрное сукно, карты слоновой бумаги, одна киноварь
    accent:     '#a8321f',
    accentDim:  '#a8321f',
    bg:         '#18231d',   // сукно
    bg2:        '#22302a',
    surface:    '#f2ead8',
    border:     'rgba(13,20,16,0.4)',
    text:       '#ece3cf',
    dim:        '#b3ae9c',

    baseBg:     '#18231d',
    baseTone:   'dark',
    showTimer:  false,

    // Мир «Ходилки» в обличье колоды: клетки — карты, будущие лежат рубашкой вверх,
    // пройденная переворачивается и показывает свой знак
    world: {
      decor:        'tarot',
      field:        '#18231d',
      fieldInk:     '#ece3cf',
      fieldInkSoft: '#b3ae9c',
      paper:        '#f2ead8',   // карта
      paperEdge:    '#d8ccb0',   // срез колоды
      ink:          '#221d18',   // гравюра
      inkSoft:      '#5a5147',
      plate:        '#f2ead8',   // открытая карта «сейчас»
      plateInk:     '#221d18',
      done:         '#f2ead8',   // перевёрнутая карта со знаком
      back:         '#a8321f',   // рубашка: киноварь
      chip:         '#a8321f',
      rule:         '#0d1410',
      wrong:        '#9b2f1f',
      action:       '#a8321f',
      actionInk:    '#f2ead8',
      actionHover:  '#8a2818',   // кнопка и фишка одной киноварью: наведение — глубже
      focus:        '#221d18',
    },

    // Моушн-ролик «Как это работает» (tools/reels/mystery.html → record.mjs)
    reel: { src: '/reels/mystery.mp4', poster: '/reels/mystery.jpg' },

    // Шрифты
    fonts: {
      display: "'Old Standard TT', 'PT Serif', Georgia, serif",
      body:    "'PT Serif', Georgia, serif",
      displayWeight: 700,
      // свои файлы: assets/styles/fonts.css + public/fonts
      selfHosted: true,
    },

    copy: {
      eyebrow:       'Колода разложена',
      startBtn:      'Тяни карту',
      taskDone:      'Карта открыта',
      hintBtn:       'Подсказка · −10 очков',
      photoZone:     'Сфотографировать знак',
      finishEyebrow: 'Ваш расклад',
      shareBtn:      'Поделиться раскладом',
      blockPrefix:   'Расклад',
      introHint:     'Сними бандероль и тяни карту',
      finishBtn:     'Открыть расклад',
      messageLabel:  'Последняя карта',
      splashNote:    'Карты открываются по очереди. Подглядывать вперёд не получится — так задумано.',
      blockForms:    ['расклад', 'расклада', 'раскладов'],
      cellForms:     ['карта', 'карты', 'карт'],
      cellsDone:     ['карта открыта', 'карты открыты', 'карт открыто'],
      blockDone:     'Расклад сложен. Следующий ждёт на столе.',
      allDone:       'Все карты открыты.',
      nextBtn:       'Тяни карту',
      finishShare:   'Поделиться раскладом',
      pointsLabel:   'очков',
      pointsForms:   ['очко', 'очка', 'очков'],
    },

    bg_animation: null,
    overlay: null,            // гравюра на сукне — без звёзд и тумана
  },

  // ══════════════════════════════════════════════════════════════
  // ИСКАТЕЛЬ КЛАДА — карта, золото, приключение
  // ══════════════════════════════════════════════════════════════
  treasure: {
    id: 'treasure',
    label: 'Искатель клада',

    // Цвета — пиратская карта: море старой карты, пергаментный остров, чернила и один красный крест
    accent:     '#b3261e',
    accentDim:  '#b3261e',
    bg:         '#1f4547',   // море
    bg2:        '#2a5557',
    surface:    '#ecdcb4',
    border:     'rgba(14,32,33,0.4)',
    text:       '#ecdfc0',
    dim:        '#a9bcb2',

    baseBg:     '#1f4547',
    baseTone:   'dark',
    showTimer:  false,

    // Мир «Ходилки» в обличье пиратской карты: метки на пергаментном острове,
    // пройденную перечёркивает красный крест, фишка — флажок на древке
    world: {
      decor:        'map',
      field:        '#1f4547',
      fieldInk:     '#ecdfc0',
      fieldInkSoft: '#a9bcb2',
      paper:        '#ecdcb4',   // пергамент
      paperEdge:    '#c9b285',   // старый край, обрез
      ink:          '#2a1f14',   // чернила из орешков
      inkSoft:      '#5e4b33',
      plate:        '#ecdcb4',   // метка «сейчас»
      plateInk:     '#2a1f14',
      done:         '#ecdcb4',   // пройденная, под красным крестом
      back:         '#ecdcb4',   // впереди: пустой кружок
      chip:         '#b3261e',   // крест и вымпел флажка
      rule:         '#0e2021',
      wrong:        '#8f3a1c',
      action:       '#b3261e',
      actionInk:    '#f4ead2',
      actionHover:  '#8f1d17',   // кнопка и крест одной краской: наведение — глубже
      focus:        '#2a1f14',
      sealWax:      '#9b2a20',
      sealDeep:     '#6e1a13',
    },

    // Моушн-ролик «Как это работает» (tools/reels/treasure.html → record.mjs)
    reel: { src: '/reels/treasure.mp4', poster: '/reels/treasure.jpg' },

    // Шрифты
    fonts: {
      display: "'Kurale', 'PT Serif', Georgia, serif",
      body:    "'PT Serif', Georgia, serif",
      // свои файлы: assets/styles/fonts.css + public/fonts
      selfHosted: true,
    },

    copy: {
      eyebrow:       'Карта готова',
      startBtn:      'В путь',
      taskDone:      'Метка найдена',
      hintBtn:       'Подсказка · −10 дублонов',
      photoZone:     'Сфотографировать находку',
      finishEyebrow: 'Клад найден!',
      shareBtn:      'Поделиться добычей',
      blockPrefix:   'Остров',
      introHint:     'Сломай печать и разверни карту',
      finishBtn:     'К кладу',
      messageLabel:  'Записка в сундуке',
      splashNote:    'Метки открываются по очереди. Подглядывать вперёд не получится — так задумано.',
      blockForms:    ['остров', 'острова', 'островов'],
      cellForms:     ['метка', 'метки', 'меток'],
      cellsDone:     ['метка найдена', 'метки найдены', 'меток найдено'],
      blockDone:     'Остров пройден. Корабль ждёт у берега.',
      allDone:       'Все метки найдены.',
      nextBtn:       'Плыть дальше',
      finishShare:   'Поделиться добычей',
      pointsLabel:   'дублонов',
      pointsForms:   ['дублон', 'дублона', 'дублонов'],
    },

    bg_animation: null,
    overlay: null,            // карта — плоская печать, без зерна и золотых частиц
  },

  // ══════════════════════════════════════════════════════════════
  // ПРЕДЛОЖЕНИЕ — бриллианты, золото, шампанское
  // ══════════════════════════════════════════════════════════════
  proposal: {
    id: 'proposal',
    label: 'Предложение',

    // Цвета — футляр с кольцом: пудровый бархат, слоновый шёлк, одна гранатовая краска
    accent:     '#8e1f2f',
    accentDim:  '#8e1f2f',
    bg:         '#e8cdc4',   // бархат
    bg2:        '#d9b6ab',
    surface:    '#fbf4ec',
    border:     'rgba(59,29,34,0.22)',
    text:       '#3b1d22',
    dim:        '#6e4a4c',

    baseBg:     '#e8cdc4',
    baseTone:   'light',
    showTimer:  false,

    // Мир «Ходилки» в обличье футляра: клетки — маленькие футляры, пройденный
    // открыт и показывает камешек, фишка — жемчужина
    world: {
      decor:        'ringbox',
      field:        '#e8cdc4',
      fieldInk:     '#3b1d22',
      fieldInkSoft: '#6e4a4c',
      paper:        '#fbf4ec',   // шёлк подкладки
      paperEdge:    '#ead6c8',
      ink:          '#2e1a1c',
      inkSoft:      '#6a5052',
      plate:        '#f6e6dc',   // крышка футляра «сейчас»
      plateInk:     '#2e1a1c',
      done:         '#fbf4ec',   // открытый футляр: подушечка
      back:         '#c99c91',   // закрытый футляр, бархат глубже поля
      chip:         '#8e1f2f',   // камень и лента
      rule:         '#3b1d22',
      wrong:        '#7a3b2e',
      action:       '#8e1f2f',
      actionInk:    '#fbf4ec',
      actionHover:  '#6f1624',
      focus:        '#2e1a1c',
    },

    // Моушн-ролик «Как это работает» (tools/reels/proposal.html → record.mjs)
    reel: { src: '/reels/proposal.mp4', poster: '/reels/proposal.jpg' },

    // Шрифты
    fonts: {
      display: "'Prata Digits', 'Prata', 'PT Serif', Georgia, serif",
      body:    "'PT Serif', Georgia, serif",
      // свои файлы: assets/styles/fonts.css + public/fonts
      selfHosted: true,
    },

    copy: {
      eyebrow:       'Особый вечер',
      startBtn:      'Открыть',
      taskDone:      'Шаг сделан',
      hintBtn:       'Подсказка · −10 очков',
      photoZone:     'Сохранить момент',
      finishEyebrow: 'А теперь — главный вопрос',
      shareBtn:      'Поделиться',
      blockPrefix:   'Момент',
      introHint:     'Потяни за ленту',
      finishBtn:     'К главному',
      messageLabel:  'От меня',
      splashNote:    'Шаги открываются по очереди. Подглядывать вперёд не получится — так задумано.',
      blockForms:    ['момент', 'момента', 'моментов'],
      cellForms:     ['шаг', 'шага', 'шагов'],
      cellsDone:     ['шаг пройден', 'шага пройдено', 'шагов пройдено'],
      blockDone:     'Момент позади. Впереди — следующий.',
      allDone:       'Все шаги пройдены.',
      nextBtn:       'Дальше',
      pointsLabel:   'очков',
      pointsForms:   ['очко', 'очка', 'очков'],
    },

    bg_animation: null,
    overlay: null,            // бархат и шёлк — без колец, бликов и свечения
  },
  city: {
    id: 'city',
    label: 'Город',

    // Цвета — схема линий и талон: светлая бумага, чёрная краска, одна зелёная линия
    accent:     '#1f8a4c',
    accentDim:  '#1f8a4c',
    bg:         '#e9eeea',   // бумага схемы
    bg2:        '#dcd5c6',
    surface:    '#f5e8c6',
    border:     'rgba(31,36,34,0.22)',
    text:       '#1f2422',
    dim:        '#4c5450',

    baseBg:     '#e9eeea',
    baseTone:   'light',
    showTimer:  false,

    // Мир «Ходилки» в обличье схемы метро: клетки — станции на зелёной линии,
    // карточка — талон с корешком, пройденную станцию пробивает компостер
    world: {
      decor:        'metro',
      field:        '#e9eeea',
      fieldInk:     '#1f2422',
      fieldInkSoft: '#4c5450',
      paper:        '#f5e8c6',   // талон
      paperEdge:    '#d8c9a4',   // картон проездного, корешок
      ink:          '#1f2422',
      inkSoft:      '#545c58',
      plate:        '#fbf9f3',   // станция «вы здесь»
      plateInk:     '#1f2422',
      done:         '#1f8a4c',   // станция пройдена, талон пробит
      back:         '#fbf9f3',   // станция впереди: пустой кружок
      chip:         '#1f8a4c',   // линия маршрута
      rule:         '#1f2422',
      wrong:        '#b8392a',
      action:       '#1f2422',
      actionInk:    '#f5e8c6',
      focus:        '#1f2422',
    },

    // Моушн-ролик «Как это работает» (tools/reels/city.html → record.mjs)
    reel: { src: '/reels/city.mp4', poster: '/reels/city.jpg' },

    // Шрифты
    fonts: {
      display: "'Golos Text', 'PT Serif', Arial, sans-serif",
      body:    "'PT Serif', Georgia, serif",
      displayWeight: 700,
      // свои файлы: assets/styles/fonts.css + public/fonts
      selfHosted: true,
    },

    copy: {
      eyebrow:       'Маршрут готов',
      startBtn:      'Поехали',
      taskDone:      'Станция пройдена',
      hintBtn:       'Подсказка · −10 очков',
      photoZone:     'Сфотографировать точку',
      finishEyebrow: 'Конечная!',
      shareBtn:      'Поделиться результатом',
      blockPrefix:   'Линия',
      introHint:     'Приложи проездной',
      finishBtn:     'На конечную',
      messageLabel:  'Личное сообщение',
      splashNote:    'Станции открываются по очереди. Подглядывать вперёд не получится — так задумано.',
      blockForms:    ['линия', 'линии', 'линий'],
      pointsLabel:   'очков',
      pointsForms:   ['очко', 'очка', 'очков'],
    },

    bg_animation: null,
    overlay: null,            // мир схемы — плоская печать, без сканлайнов
  },

  // ══════════════════════════════════════════════════════════════
  // ЗЕЛЬЕВАРНЯ — школа волшебства, кабинет зелий в каменном подвале
  // ══════════════════════════════════════════════════════════════
  potion: {
    id: 'potion',
    label: 'Зельеварня',

    // Цвета — каменный подвал, тёплая бумага рецептов, одно янтарное зелье
    accent:     '#a5531a',
    accentDim:  '#e0892b',
    bg:         '#2b3540',   // камень
    bg2:        '#35414d',
    surface:    '#efe7d6',
    border:     'rgba(20,26,32,0.45)',
    text:       '#e6e1d6',
    dim:        '#a9b0b6',

    baseBg:     '#2b3540',
    baseTone:   'dark',
    showTimer:  false,

    // Мир «Ходилки» в обличье зельеварни: клетки — флаконы на медной трубке,
    // пройденный наполняется зельем, фишка — капля
    world: {
      decor:        'potion',
      field:        '#2b3540',
      fieldInk:     '#e6e1d6',
      fieldInkSoft: '#a9b0b6',
      paper:        '#efe7d6',   // страница рецепта, ярлык
      paperEdge:    '#d6c9ae',   // пробка, срез бумаги
      ink:          '#1f2328',
      inkSoft:      '#545a60',
      plate:        '#efe7d6',
      plateInk:     '#1f2328',
      done:         '#e0892b',
      back:         '#35414d',
      chip:         '#e0892b',   // зелье, капля
      rule:         '#141a20',
      wrong:        '#a0442a',
      action:       '#a5531a',
      actionInk:    '#fff6e8',
      actionHover:  '#86410f',
      focus:        '#1f2328',
      wax:          '#6e3a1e',   // сургуч на пробке флакона-крышки
    },

    // Моушн-ролик «Как это работает» (tools/reels/potion.html → record.mjs)
    reel: { src: '/reels/potion.mp4', poster: '/reels/potion.jpg' },

    // Шрифты
    fonts: {
      display: "'Philosopher', 'PT Serif', Georgia, serif",
      body:    "'PT Serif', Georgia, serif",
      displayWeight: 700,
      // свои файлы: assets/styles/fonts.css + public/fonts
      selfHosted: true,
    },

    copy: {
      eyebrow:       'Котёл разогрет',
      startBtn:      'Начать варку',
      taskDone:      'Флакон наполнен',
      hintBtn:       'Подсказка · −10 капель',
      photoZone:     'Сфотографировать ингредиент',
      finishEyebrow: 'Зелье готово!',
      shareBtn:      'Поделиться зельем',
      blockPrefix:   'Рецепт',
      introHint:     'Вынь пробку',
      finishBtn:     'Снять с огня',
      messageLabel:  'К зелью прилагается',
      splashNote:    'Флаконы наполняются по очереди. Подглядывать вперёд не получится — так задумано.',
      blockForms:    ['рецепт', 'рецепта', 'рецептов'],
      cellForms:     ['флакон', 'флакона', 'флаконов'],
      cellsDone:     ['флакон наполнен', 'флакона наполнено', 'флаконов наполнено'],
      blockDone:     'Рецепт сварен. На полке ждёт следующий.',
      allDone:       'Все флаконы наполнены.',
      nextBtn:       'Следующий рецепт',
      finishShare:   'Поделиться зельем',
      pointsLabel:   'капель',
      pointsForms:   ['капля', 'капли', 'капель'],
    },

    bg_animation: null,
    overlay: null,            // камень и стекло — без пара, свечения и бликов
  },

  // ══════════════════════════════════════════════════════════════
  // ХЕЛЛОУИН — бумажная вырубка 1920–30-х, жутко-романтично, без хоррора
  // ══════════════════════════════════════════════════════════════
  halloween: {
    id: 'halloween',
    label: 'Хеллоуин',

    // Цвета — тёплый чёрный картон, кремовая бумага, один тыквенный оранжевый
    accent:     '#e8711c',
    accentDim:  '#e8711c',
    bg:         '#1c1714',   // картон
    bg2:        '#2a221d',
    surface:    '#f3e6c8',
    border:     'rgba(15,12,10,0.5)',
    text:       '#f1e3c6',
    dim:        '#b9a98e',

    baseBg:     '#1c1714',
    baseTone:   'dark',
    showTimer:  false,

    // Мир «Ходилки» в обличье бумажной вырубки: клетки — тыквы, у пройденной
    // прорезано лицо, маршрут — нить гирлянды, фишка — силуэт кота
    world: {
      decor:        'diecut',
      field:        '#1c1714',
      fieldInk:     '#f1e3c6',
      fieldInkSoft: '#b9a98e',
      paper:        '#f3e6c8',   // кремовая бумага вырубки, прорези тыкв
      paperEdge:    '#d9c39a',
      ink:          '#1c1714',
      inkSoft:      '#5a4a3c',
      plate:        '#f3e6c8',
      plateInk:     '#1c1714',
      done:         '#e8711c',
      back:         '#3b302a',   // тыква, которую ещё не вырезали
      chip:         '#e8711c',   // тыквенный оранжевый
      rule:         '#0f0c0a',
      wrong:        '#b5432a',
      action:       '#e8711c',
      actionInk:    '#1c1714',
      actionHover:  '#f08a3c',   // тёмный текст на оранжевом: наведение — светлее
      focus:        '#1c1714',
    },

    // Моушн-ролик «Как это работает» (tools/reels/halloween.html → record.mjs)
    reel: { src: '/reels/halloween.mp4', poster: '/reels/halloween.jpg' },

    // Шрифты
    fonts: {
      display: "'Yanone Kaffeesatz', 'PT Serif', Georgia, serif",
      body:    "'PT Serif', Georgia, serif",
      displayWeight: 700,
      // свои файлы: assets/styles/fonts.css + public/fonts
      selfHosted: true,
    },

    copy: {
      eyebrow:       'Тыквы ждут',
      startBtn:      'Сладость или гадость',
      taskDone:      'Тыква вырезана',
      hintBtn:       'Подсказка · −10 конфет',
      photoZone:     'Сфотографировать находку',
      finishEyebrow: 'Сладость найдена!',
      shareBtn:      'Поделиться уловом',
      blockPrefix:   'Дом',
      introHint:     'Открой приглашение',
      finishBtn:     'Домой',
      messageLabel:  'В корзинке с конфетами',
      splashNote:    'Тыквы вырезаются по очереди. Подглядывать вперёд не получится — так задумано.',
      blockForms:    ['дом', 'дома', 'домов'],
      cellForms:     ['тыква', 'тыквы', 'тыкв'],
      cellsDone:     ['тыква вырезана', 'тыквы вырезано', 'тыкв вырезано'],
      blockDone:     'Дом обойдён. Следующая дверь ждёт.',
      allDone:       'Все тыквы вырезаны.',
      nextBtn:       'К следующему дому',
      finishShare:   'Поделиться уловом',
      pointsLabel:   'конфет',
      pointsForms:   ['конфета', 'конфеты', 'конфет'],
    },

    bg_animation: null,
    overlay: null,            // плоский картон — без тумана, свечения и неона
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

// Римский номер карты: I, II, … XXI
export const roman = (n) => {
  const R = [[50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']]
  let out = ''
  for (const [v, r] of R) while (n >= v) { out += r; n -= v }
  return out
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
    ...(w.actionHover && { '--action-hover': w.actionHover }),
    // фокус и выделение на бумаге: по умолчанию краска фишки
    '--focus':          w.focus        ?? w.chip ?? theme.accent,
    // сургуч: без своего цвета QuestSeal берёт запасной красный
    ...(w.sealWax  && { '--seal-wax':  w.sealWax }),
    ...(w.sealDeep && { '--seal-deep': w.sealDeep }),
    // сургуч на пробке (тема «Зельеварня»)
    ...(w.wax && { '--wax': w.wax }),
    ...worldArt(w),
  }
}

// Узоры-картинки мира. Внутрь data-URI CSS-переменные не проходят,
// поэтому SVG собирается здесь из цветов темы и отдаётся переменной --art-*:
// сменится цвет темы — сменится и узор.
const svgUrl = (svg) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
const SVG = "xmlns='http://www.w3.org/2000/svg'"

// смесь двух hex-цветов: доля t первого, как color-mix(in srgb, a t, b)
const mixHex = (a, b, t) => {
  const ch = (h, i) => parseInt(h.slice(1 + i * 2, 3 + i * 2), 16)
  return '#' + [0, 1, 2].map(i => Math.round(ch(a, i) * t + ch(b, i) * (1 - t)).toString(16).padStart(2, '0')).join('')
}

const ROSE_RAYS = 'M20 1 L23 17 L39 20 L23 23 L20 39 L17 23 L1 20 L17 17 Z'
const SEA_WAVES = (ink) => svgUrl(`<svg ${SVG} width='64' height='40'><path d='M4 12 q4 -4 8 0 t8 0 M36 32 q4 -4 8 0 t8 0' fill='none' stroke='${ink}' stroke-opacity='.22' stroke-width='1.4' stroke-linecap='round'/></svg>`)

const worldArt = (w) => {
  switch (w.decor) {
    case 'map': return {
      // роза ветров мелом в море и волны — поле доски и крышки
      '--art-sea-rose': svgUrl(`<svg ${SVG} viewBox='0 0 40 40'><g fill='none' stroke='${w.fieldInk}' stroke-opacity='.5' stroke-width='.7' stroke-linejoin='round'><circle cx='20' cy='20' r='13'/><circle cx='20' cy='20' r='16.5'/><path d='${ROSE_RAYS} M20 8 L21.6 18.4 L32 20 L21.6 21.6 L20 32 L18.4 21.6 L8 20 L18.4 18.4 Z' transform='rotate(45 20 20)'/><path d='${ROSE_RAYS}'/></g><path d='M20 1 L23 17 L20 20 Z M39 20 L23 23 L20 20 Z M20 39 L17 23 L20 20 Z M1 20 L17 17 L20 20 Z' fill='${w.fieldInk}' fill-opacity='.45'/></svg>`),
      '--art-sea-waves': SEA_WAVES(w.fieldInk),
      // рубашка «Найди пары»: роза ветров чернилами на пергаменте
      '--art-card-back': svgUrl(`<svg ${SVG} viewBox='0 0 40 40'><g fill='none' stroke='${w.ink}' stroke-width='1.4' stroke-linejoin='round'><circle cx='20' cy='20' r='13'/><path d='M20 3 L23 17 L37 20 L23 23 L20 37 L17 23 L3 20 L17 17 Z'/></g><path d='M20 3 L23 17 L20 20 Z M37 20 L23 23 L20 20 Z M20 37 L17 23 L20 20 Z M3 20 L17 17 L20 20 Z' fill='${w.ink}'/></svg>`),
    }
    case 'potion': return {
      // рубашка «Найди пары»: пустой флакон мелом на камне
      '--art-card-back': svgUrl(`<svg ${SVG} viewBox='0 0 40 48'><path d='M16 5 H24 V17 Q34 20.5 34 31.5 A14 14 0 1 1 6 31.5 Q6 20.5 16 17 Z' fill='none' stroke='${w.fieldInk}' stroke-opacity='.75' stroke-width='1.6' stroke-linejoin='round'/></svg>`),
    }
    case 'diecut': return {
      // рубашка «Найди пары»: невырезанная тыква, цвета как у QuestPumpkin
      '--art-card-back': svgUrl(`<svg ${SVG} viewBox='0 0 40 40'><path d='M18.6 12.4 C18.4 8.6 19.6 6.2 22.6 4.8 L24 6.6 C22 7.6 21.4 9.4 21.6 12.4 Z' fill='${mixHex(w.chip, w.rule, .3)}' stroke='${w.rule}' stroke-width='.9'/><ellipse cx='20' cy='24.5' rx='16' ry='12.5' fill='${w.chip}' stroke='${w.rule}' stroke-width='1.5'/><path d='M20 12 C12.5 15 12.5 34 20 37 M20 12 C27.5 15 27.5 34 20 37' fill='none' stroke='${w.rule}' stroke-width='1.2'/></svg>`),
    }
    default: return {}
  }
}