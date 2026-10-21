<template>
  <span
    class="mark"
    :class="[`mark--${decor || 'base'}`, `mark--${kind}`]"
    role="status"
  >{{ word }}</span>
</template>

<script setup>
import { computed } from 'vue'

// Отметка на карточке задания в языке мира: неверно / верно / отложено.
// Ложится на угол карточки, держится мгновение и бледнеет — без тряски и пружин.
const props = defineProps({
  decor: { type: String, default: null },
  kind:  { type: String, default: 'wrong' },   // 'wrong' | 'right' | 'skip'
})

const WORDS = {
  casefile: { wrong: 'Мимо',          right: 'Верно',          skip: 'Отложено' },
  letters:  { wrong: 'Возврат',       right: 'Доставлено',     skip: 'Не вручено' },
  metro:    { wrong: 'Не та станция', right: 'Пробито',        skip: 'Пересадка' },
  tarot:    { wrong: 'Не та карта',   right: 'Карта легла',    skip: 'Отложена' },
  map:      { wrong: 'Мимо',          right: 'Есть!',          skip: 'Позже' },
  ringbox:  { wrong: 'Почти',         right: 'Да',             skip: 'Потом' },
  potion:   { wrong: 'Не то зелье',   right: 'Сварено',        skip: 'Отложено' },
  diecut:   { wrong: 'Гадость!',      right: 'Сладость!',      skip: 'Позже' },
  base:     { wrong: 'Неверно',       right: 'Верно',          skip: 'Пропущено' },
}

const word = computed(() => (WORDS[props.decor] ?? WORDS.base)[props.kind])
</script>

<style scoped>
/* База: штамп с двойной рамкой, ложится с лёгким поворотом и бледнеет */
.mark {
  position: absolute; top: 12px; right: 12px;
  z-index: 3;
  padding: 5px 12px 4px;
  border: 3px double currentColor;
  border-radius: 6px;
  font-family: var(--font-d);
  font-weight: var(--font-d-wt, 400);
  font-size: 1.05rem;
  line-height: 1.1;
  letter-spacing: .04em;
  text-transform: uppercase;
  white-space: nowrap;
  pointer-events: none;
  transform: rotate(-8deg);
  animation: mark-life 1.5s cubic-bezier(.2, .7, .2, 1) both;
}
.mark--wrong { color: var(--wrong); }
.mark--right { color: var(--ink); }
.mark--skip  { color: var(--ink-soft); }
@keyframes mark-life {
  0%   { opacity: 0; transform: rotate(-14deg) scale(1.5); }
  12%  { opacity: .92; transform: rotate(-8deg) scale(1); }
  70%  { opacity: .92; }
  100% { opacity: 0; }
}
/* верная отметка держится до хода и не бледнеет: доска открывается поверх */
.mark--right { animation-name: mark-stay; animation-duration: .5s; }
@keyframes mark-stay {
  from { opacity: 0; transform: rotate(-14deg) scale(1.5); }
  to   { opacity: .92; transform: rotate(-8deg) scale(1); }
}

/* Дело: резиновый штамп, как «Секретно» */
.mark--casefile.mark--right { color: var(--chip); }

/* Переписка: круглый почтовый штемпель */
.mark--letters {
  display: grid; place-items: center;
  width: 100px; height: 100px; padding: 6px;
  border-radius: 50%;
  border-width: 3px; border-style: double;
  font-size: .64rem;
  text-align: center;
  white-space: normal;
  letter-spacing: .08em;
}
.mark--letters.mark--right { color: var(--chip); }

/* Схема: прямоугольная печать контролёра на талоне */
.mark--metro {
  border: 2.5px solid currentColor;
  border-radius: 3px;
  font-weight: 700;
  font-size: .95rem;
  text-transform: none;
  letter-spacing: 0;
}
.mark--metro.mark--right { color: var(--done); }

/* Колода: маленькая карта, «перевёрнутая» — надпись вверх ногами у неверной */
.mark--tarot {
  border: 1.5px solid currentColor;
  border-radius: 4px;
  outline: 1px solid currentColor;
  outline-offset: 2px;
  text-transform: none;
  letter-spacing: .02em;
}
.mark--tarot.mark--wrong { transform: rotate(172deg); animation-name: mark-life-flip; }
.mark--tarot.mark--right { color: var(--chip); }
@keyframes mark-life-flip {
  0%   { opacity: 0; transform: rotate(180deg) scale(1.5); }
  12%  { opacity: .92; transform: rotate(172deg) scale(1); }
  70%  { opacity: .92; }
  100% { opacity: 0; }
}

/* Карта: надпись пером на кляксе, без рамки */
.mark--map {
  border: none;
  padding: 10px 18px 9px;
  border-radius: 46% 54% 42% 58% / 55% 45% 60% 40%;
  background: color-mix(in srgb, var(--ink) 88%, var(--paper));
  color: var(--paper);
  text-transform: none;
  letter-spacing: 0;
}
.mark--map.mark--right { background: var(--chip); }

/* Футляр: мягкая подпись без красного и без рамки-штампа */
.mark--ringbox {
  border: 1.5px solid currentColor;
  border-radius: 999px;
  padding: 4px 14px;
  text-transform: none;
  letter-spacing: 0;
  transform: rotate(-4deg);
}
.mark--ringbox.mark--wrong { color: var(--ink-soft); }
.mark--ringbox.mark--right { color: var(--chip); }

/* Зельеварня: ярлык с подрезанными углами */
.mark--potion {
  border: 2px solid currentColor;
  border-radius: 0;
  clip-path: polygon(6px 0, calc(100% - 6px) 0, 100% 6px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 6px 100%, 0 calc(100% - 6px), 0 6px);
  background: var(--paper);
  text-transform: none;
  letter-spacing: 0;
}
.mark--potion.mark--right { color: var(--action); }

/* Вырубка: «Сладость или гадость» — оранжевая пилюля для верного, бурая для неверного */
.mark--diecut {
  border: 2px solid var(--rule);
  border-radius: 999px;
  padding: 5px 14px;
  text-transform: none;
  letter-spacing: 0;
}
.mark--diecut.mark--right { background: var(--chip); color: var(--ink); }
.mark--diecut.mark--wrong { background: var(--back); color: var(--paper); }
.mark--diecut.mark--skip  { background: var(--paper); color: var(--ink-soft); }

@media (prefers-reduced-motion: reduce) {
  .mark { animation-duration: .01s; animation-delay: 0s; }
  .mark--wrong, .mark--skip { animation: mark-fade 1.5s linear both; }
  @keyframes mark-fade { 0%, 70% { opacity: .92; } 100% { opacity: 0; } }
}
</style>
