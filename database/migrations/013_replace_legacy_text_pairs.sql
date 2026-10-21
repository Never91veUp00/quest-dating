-- Текстовые пары («Соедините пары») убраны из плеера: такое задание показывает
-- только описание и «Идти дальше». Заменяем их в шаблонах и демо-квестах
-- новыми мини-играми (слово, хронология, скретч, шифр) по смыслу задания.
--
-- Трогаем только задание с указанным id, у которого всё ещё game_type = 'pairs',
-- есть текстовые пары и нет фото. Фото-пары и уже переделанные задания
-- остаются как есть, поэтому повторный прогон ничего не меняет.
-- Хронология без готового списка событий собирается из старых пар:
-- левая часть — событие, правая — подпись после решения, порядок сохраняется.

CREATE OR REPLACE FUNCTION pg_temp.swap_legacy_pairs(blocks jsonb, task_id text, patch jsonb)
RETURNS jsonb LANGUAGE sql AS $$
  SELECT COALESCE(jsonb_agg(
    CASE WHEN jsonb_typeof(b->'tasks') = 'array' THEN jsonb_set(b, '{tasks}', COALESCE((
      SELECT jsonb_agg(
        CASE WHEN t->>'id' = task_id
              AND t->>'game_type' = 'pairs'
              AND jsonb_array_length(COALESCE(t->'pairs', '[]')) > 0
              AND jsonb_array_length(COALESCE(t->'game_images', '[]')) = 0
             THEN (t - 'pairs' - 'pairs_mode' - 'pairs_grid_size' - 'game_images')
                  || CASE WHEN patch->>'game_type' = 'timeline' AND NOT patch ? 'timeline_items'
                          THEN patch || jsonb_build_object('timeline_items', (
                                 SELECT jsonb_agg(jsonb_build_object('text', p->>'left', 'caption', p->>'right', 'image', NULL) ORDER BY o)
                                 FROM jsonb_array_elements(t->'pairs') WITH ORDINALITY y(p, o)))
                          ELSE patch END
             ELSE t END
        ORDER BY ord)
      FROM jsonb_array_elements(b->'tasks') WITH ORDINALITY x(t, ord)), '[]'))
    ELSE b END
    ORDER BY bo), '[]')
  FROM jsonb_array_elements(blocks) WITH ORDINALITY z(b, bo)
$$;

DROP TABLE IF EXISTS pg_temp.legacy_pairs_swap;
CREATE TEMP TABLE legacy_pairs_swap (slug text, task_id text, patch jsonb);

INSERT INTO legacy_pairs_swap (slug, task_id, patch) VALUES
  -- Детектив: записка из архива под шифром
  ('detective-home',            't7', '{"game_type": "cipher", "title": "Шифровка из архива", "description": "В архиве нашлась записка, зашифрованная сдвигом букв. Поверни колесо по ключу и прочти её.", "game_question": "Прочти записку из архива", "cipher_phrase": "Главная улика — твоя улыбка", "cipher_shift": 9}'),
  ('detective-home-demo',       't7', '{"game_type": "cipher", "title": "Шифровка из архива", "description": "В архиве нашлась записка, зашифрованная сдвигом букв. Поверни колесо по ключу и прочти её.", "game_question": "Прочти записку из архива", "cipher_phrase": "Главная улика — твоя улыбка", "cipher_shift": 9}'),
  -- Мистика: послание звёзд
  ('starry-night-home-demo',    't6', '{"game_type": "cipher", "title": "Послание звёзд", "description": "Звёзды записали послание своим шифром. Поверни колесо по ключу — и прочтёшь, что они говорят.", "game_question": "Что говорят звёзды?", "cipher_phrase": "Звёзды сошлись на тебе", "cipher_shift": 12}'),
  -- Искатель клада: слово с карты
  ('treasure-hunter-home',      't8', '{"game_type": "word", "title": "Слово с карты", "description": "На обороте карты буквы рассыпались. Собери из них главное сокровище острова.", "game_question": "Главное сокровище этого острова — это…", "word_answer": "Мы вдвоём", "word_decoys": 2}'),
  ('treasure-hunter-home-demo', 't8', '{"game_type": "word", "title": "Слово с карты", "description": "На обороте карты буквы рассыпались. Собери из них главное сокровище острова.", "game_question": "Главное сокровище этого острова — это…", "word_answer": "Мы вдвоём", "word_decoys": 2}'),
  -- Шоколадный детектив: сладкая улика под фольгой
  ('chocolate-detective-home',      't7', '{"game_type": "scratch", "title": "Сладкая улика", "description": "Под шоколадной фольгой спрятана подсказка. Сотри слой и узнай, где искать дальше.", "game_question": "Сотри фольгу", "scratch_text": "Загляни в холодильник: на верхней полке тебя ждёт кое-что сладкое"}'),
  ('chocolate-detective-home-demo', 't7', '{"game_type": "scratch", "title": "Сладкая улика", "description": "Под шоколадной фольгой спрятана подсказка. Сотри слой и узнай, где искать дальше.", "game_question": "Сотри фольгу", "scratch_text": "Загляни в холодильник: на верхней полке тебя ждёт кое-что сладкое"}'),
  -- Предложение дома: последний секрет перед главным моментом
  ('proposal-home-demo',        't5', '{"game_type": "scratch", "title": "Последний секрет", "description": "Остался один секрет. Сотри слой — под ним то, что важнее всех заданий.", "game_question": "Сотри слой", "scratch_text": "Обернись — самое важное прямо за тобой"}'),
  -- Хронологии из «первых разов»: события и подписи берутся из старых пар
  ('time-machine-home',         't6', '{"game_type": "timeline", "title": "Наши моменты", "description": "Машина времени перепутала даты. Расставь ваши «первые разы» по порядку — от самого раннего.", "game_question": "Что было раньше — выше"}'),
  ('time-machine-home-demo',    't6', '{"game_type": "timeline", "title": "Наши моменты", "description": "Машина времени перепутала даты. Расставь ваши «первые разы» по порядку — от самого раннего.", "game_question": "Что было раньше — выше"}'),
  ('proposal-moscow-demo',      't7', '{"game_type": "timeline", "title": "Наши московские моменты", "description": "Москва помнит, как всё было. Расставь ваши места по порядку — от первой прогулки.", "game_question": "Что было раньше — выше"}'),
  ('mytishchi-park-detective',          't4', '{"game_type": "timeline", "title": "Перепутанные улики", "description": "Улики перепутались. Восстанови хронологию: что случилось раньше — выше.", "game_question": "Восстанови порядок событий"}'),
  ('mytishchi-park-detective-birthday', 't4', '{"game_type": "timeline", "title": "Перепутанные улики", "description": "Улики перепутались. Восстанови хронологию: что случилось раньше — выше.", "game_question": "Восстанови порядок событий"}');

UPDATE quest_templates q
SET structure = pg_temp.swap_legacy_pairs(q.structure, s.task_id, s.patch),
    updated_at = CURRENT_TIMESTAMP
FROM legacy_pairs_swap s
WHERE q.slug = s.slug
  AND pg_temp.swap_legacy_pairs(q.structure, s.task_id, s.patch) IS DISTINCT FROM q.structure;

UPDATE created_quests q
SET blocks = pg_temp.swap_legacy_pairs(q.blocks, s.task_id, s.patch),
    updated_at = CURRENT_TIMESTAMP
FROM legacy_pairs_swap s
WHERE q.slug = s.slug
  AND pg_temp.swap_legacy_pairs(q.blocks, s.task_id, s.patch) IS DISTINCT FROM q.blocks;

DROP TABLE IF EXISTS legacy_pairs_swap;
