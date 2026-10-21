// Чистая логика новых мини-игр: «Слово из букв», «Хронология», «Шифр-колесо».
// Компоненты берут отсюда правила, чтобы их можно было проверить без браузера.

export const RU_ALPHABET = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'

const mod = (n, m) => ((n % m) + m) % m

// Шифр сдвига по русскому алфавиту; регистр сохраняется, остальное — как есть
export const caesar = (text, shift) => [...(text || '')].map((ch) => {
  const up = ch.toUpperCase()
  const i  = RU_ALPHABET.indexOf(up)
  if (i < 0) return ch
  const out = RU_ALPHABET[mod(i + shift, RU_ALPHABET.length)]
  return ch === up ? out : out.toLowerCase()
}).join('')

// Сдвиг для новой фразы: от 3 до 29, чтобы шифр не читался «на глаз»
export const randomShift = (rnd = Math.random) => 3 + Math.floor(rnd() * 27)

const LETTER = /[A-ZА-ЯЁ0-9]/

// Ответ «Слова из букв» — слова из заглавных букв, знаки отброшены
export const wordSlots = (answer) => (answer || '')
  .toUpperCase()
  .split(/\s+/)
  .map(w => [...w].filter(ch => LETTER.test(ch)))
  .filter(w => w.length)

const shuffle = (arr, rnd) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Фишки: буквы ответа и несколько лишних, перемешаны так, чтобы слово не лежало готовым
export const wordTiles = (answer, decoys = 0, rnd = Math.random) => {
  const letters = wordSlots(answer).flat()
  const extra = Array.from({ length: Math.max(0, decoys) }, () => RU_ALPHABET[Math.floor(rnd() * RU_ALPHABET.length)])
  const all = [...letters, ...extra].map((ch, id) => ({ id, ch }))
  let tiles = shuffle(all, rnd)
  const same = (t) => t.map(x => x.ch).join('').startsWith(letters.join(''))
  if (letters.length > 1 && same(tiles)) tiles = [...tiles.slice(1), tiles[0]]
  if (letters.length > 1 && same(tiles)) tiles = [tiles[1], tiles[0], ...tiles.slice(2)]
  return tiles
}

const squash = (s) => (s || '').toUpperCase().replace(/Ё/g, 'Е').replace(/[^A-ZА-Я0-9]/g, '')

export const isWordMatch = (input, answer) => squash(input) === squash(answer)

// Порядок показа событий «Хронологии»: перестановка, не совпадающая с правильной
export const shuffledOrder = (n, rnd = Math.random) => {
  const idx = Array.from({ length: n }, (_, i) => i)
  if (n < 2) return idx
  let out = shuffle(idx, rnd)
  if (out.every((v, i) => v === i)) out = [...out.slice(1), out[0]]
  return out
}
