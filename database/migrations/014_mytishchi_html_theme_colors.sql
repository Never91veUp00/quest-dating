-- В HTML-описаниях квеста «Мытищи» (mytishchi-detective) цвета вписаны под
-- старую тёмную тему: белый с прозрачностью для плашек и подписей, акцент для
-- текста. На светлой бумаге мира подписи вроде «Шифровка» почти не видны.
-- Переводим их на токены мира плеера; слова, эмодзи и разметка не меняются.
-- Повторный прогон ничего не меняет: старых значений после замены не остаётся.

UPDATE created_quests
SET blocks = replace(replace(replace(replace(replace(blocks::text,
      'rgba(255,255,255,.04)', 'color-mix(in srgb,var(--ink) 5%,transparent)'),
      'rgba(255,255,255,.1)',  'color-mix(in srgb,var(--ink) 18%,transparent)'),
      'rgba(255,255,255,.45)', 'var(--ink-soft)'),
      'rgba(255,255,255,.35)', 'var(--ink-soft)'),
      'color:var(--accent)',   'color:var(--ink)')::jsonb,
    updated_at = CURRENT_TIMESTAMP
WHERE slug = 'mytishchi-detective'
  AND blocks::text ~ 'rgba\(255,255,255,\.(04|1|45|35)\)|color:var\(--accent\)';
