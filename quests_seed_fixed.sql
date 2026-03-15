-- ============================================================
-- 5 шаблонов квестов для каталога (исправленные category slug)
-- Категории из реальной БД:
-- 1 city-quests, 2 park-adventures, 3 home-quests
-- 4 extreme, 5 cultural, 6 gastronomic
-- ============================================================

-- КВЕСТ 1: Детективное расследование (домашний)
INSERT INTO quest_templates (
  author_id, category_id, title, slug, tagline, description,
  difficulty, duration_minutes, location_type,
  min_locations, max_locations, structure, base_price,
  status, published_at, meta_description
)
SELECT
  (SELECT id FROM authors ORDER BY id LIMIT 1),
  3,
  'Детективное расследование',
  'detective-home',
  'Раскройте дело о пропавшем подарке',
  'Вечер превращается в детективную историю. Один из вас — детектив, второй — главный свидетель. Серия улик, зашифрованных записок и логических задач ведёт к финальной разгадке — и к сюрпризу, который ждёт в конце расследования.

Квест полностью проходится дома, не требует заранее спрятанных предметов и специальной подготовки — только телефон и желание поиграть.',
  'medium', 60, 'indoor', 1, 1,
  '{"intro": {"title": "Дело №7: Пропавший подарок", "theme": "detective"}}',
  49900, 'published', CURRENT_TIMESTAMP,
  'Домашний детективный квест для двоих — раскройте дело о пропавшем подарке. 6 этапов загадок и улик, финальный сюрприз.'
WHERE NOT EXISTS (SELECT 1 FROM quest_templates WHERE slug = 'detective-home');

-- КВЕСТ 2: Машина времени (домашний / годовщина)
INSERT INTO quest_templates (
  author_id, category_id, title, slug, tagline, description,
  difficulty, duration_minutes, location_type,
  min_locations, max_locations, structure, base_price,
  status, published_at, meta_description
)
SELECT
  (SELECT id FROM authors ORDER BY id LIMIT 1),
  3,
  'Машина времени',
  'time-machine-home',
  'Путешествие по вашей общей истории',
  'Этот квест — билет в прошлое. Каждый этап переносит вас в определённый момент ваших отношений: первое сообщение, первый совместный вечер, смешная история, важный день. Вопросы, загадки и маленькие открытия о том, как вы оказались там, где вы есть сейчас.

Идеально для годовщины. Не требует ничего, кроме телефона и воспоминаний.',
  'easy', 45, 'indoor', 1, 1,
  '{"intro": {"title": "Машина времени запущена", "theme": "romantic"}}',
  49900, 'published', CURRENT_TIMESTAMP,
  'Романтический квест-путешествие по истории пары. Вопросы, загадки и воспоминания о важных моментах отношений. Идеально для годовщины.'
WHERE NOT EXISTS (SELECT 1 FROM quest_templates WHERE slug = 'time-machine-home');

-- КВЕСТ 3: Искатель клада (домашний)
INSERT INTO quest_templates (
  author_id, category_id, title, slug, tagline, description,
  difficulty, duration_minutes, location_type,
  min_locations, max_locations, structure, base_price,
  status, published_at, meta_description
)
SELECT
  (SELECT id FROM authors ORDER BY id LIMIT 1),
  3,
  'Искатель клада',
  'treasure-hunter-home',
  'Найдите сокровище по зашифрованной карте',
  'Зашифрованная карта, пиратские загадки, тайные коды и финальный клад — всё это умещается в один вечер дома. Квест в духе настоящего приключения: шифры, логические задачи, маленькие испытания и сюрприз в финале.

Подходит для тех, кто любит игры и хочет провести вечер активно и весело. Сложнее, чем кажется — но не настолько, чтобы расстроиться.',
  'medium', 75, 'indoor', 1, 1,
  '{"intro": {"title": "Капитан передаёт карту", "theme": "treasure"}}',
  49900, 'published', CURRENT_TIMESTAMP,
  'Домашний квест в стиле охоты за сокровищами. Шифры, загадки, пиратская тема. 7 этапов, финальный клад-сюрприз.'
WHERE NOT EXISTS (SELECT 1 FROM quest_templates WHERE slug = 'treasure-hunter-home');

-- КВЕСТ 4: Звёздная ночь (домашний)
INSERT INTO quest_templates (
  author_id, category_id, title, slug, tagline, description,
  difficulty, duration_minutes, location_type,
  min_locations, max_locations, structure, base_price,
  status, published_at, meta_description
)
SELECT
  (SELECT id FROM authors ORDER BY id LIMIT 1),
  3,
  'Звёздная ночь',
  'starry-night-home',
  'Романтическое путешествие между звёздами',
  'Тёплый, нежный квест для особого вечера. Каждый блок — это «планета» с заданием: написать что-то важное, вспомнить совместный момент, ответить на вопрос о партнёре. Финал — маленькое признание, которое останется с вами.

Мягкая сложность, никакого стресса. Просто красивый вечер вдвоём.',
  'easy', 40, 'indoor', 1, 1,
  '{"intro": {"title": "Добро пожаловать во вселенную", "theme": "mystery"}}',
  49900, 'published', CURRENT_TIMESTAMP,
  'Романтический домашний квест в космической теме. 5 этапов, лёгкие задания, финальное признание.'
WHERE NOT EXISTS (SELECT 1 FROM quest_templates WHERE slug = 'starry-night-home');

-- КВЕСТ 5: Шоколадный детектив (домашний)
INSERT INTO quest_templates (
  author_id, category_id, title, slug, tagline, description,
  difficulty, duration_minutes, location_type,
  min_locations, max_locations, structure, base_price,
  status, published_at, meta_description
)
SELECT
  (SELECT id FROM authors ORDER BY id LIMIT 1),
  3,
  'Шоколадный детектив',
  'chocolate-detective-home',
  'Сладкие загадки и вкусный финал',
  'Игривый, тёплый квест для уютного вечера. Загадки связаны с едой, вкусами и совместными воспоминаниями о кафе, ужинах и маленьких радостях. Каждый правильный ответ приближает к финальному сюрпризу — чему-то сладкому и особенному.

Лёгкий, смешной, немного романтичный. Хорошо работает с бокалом вина и пледом.',
  'easy', 50, 'indoor', 1, 1,
  '{"intro": {"title": "Дело о пропавшем десерте", "theme": "romantic"}}',
  49900, 'published', CURRENT_TIMESTAMP,
  'Игривый домашний квест с кулинарной темой. Загадки о еде и совместных воспоминаниях, сладкий финал.'
WHERE NOT EXISTS (SELECT 1 FROM quest_templates WHERE slug = 'chocolate-detective-home');

-- Проверка
SELECT id, slug, title, base_price / 100 AS price_rub, status
FROM quest_templates
WHERE slug IN (
  'detective-home', 'time-machine-home', 'treasure-hunter-home',
  'starry-night-home', 'chocolate-detective-home'
);
