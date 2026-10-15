/**
 * Проверка текстовых ответов в плеере квестов.
 *
 * Игрок вводит ответ с телефона на ходу, поэтому одна опечатка не должна
 * стоить ему задания. Правила:
 * - нормализация: регистр, пробелы по краям и внутри, «ё» = «е»;
 * - допускается одна правка (вставка, удаление, замена или перестановка
 *   двух соседних символов — расстояние Дамерау–Левенштейна, вариант OSA).
 *   Перестановку считаем одной правкой: «вананя» вместо «ванная» — типичная
 *   ошибка быстрого набора большим пальцем;
 * - короткие ответы (до 3 символов) и числовые коды сравниваются точно:
 *   в них одна правка меняет смысл («кот» ≠ «кит», «1235» ≠ «1234»);
 * - если правильных ответов несколько, проверяется каждый.
 */

/** Ответы короче этой длины сравниваются только точно */
export const MIN_LENGTH_FOR_TYPOS = 4

/** Сколько правок прощаем */
export const MAX_TYPOS = 1

const NUMERIC_RE = /^[\d\s-]+$/

/**
 * Приводит ответ к виду для сравнения
 * @param {unknown} value
 * @returns {string}
 */
export function normalizeAnswer(value) {
  if (value === null || value === undefined) return ''
  return String(value)
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Расстояние Дамерау–Левенштейна (optimal string alignment):
 * вставка, удаление, замена и перестановка соседних символов стоят 1.
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
export function editDistance(a, b) {
  const s = Array.from(a)
  const t = Array.from(b)
  const rows = s.length + 1
  const cols = t.length + 1
  const d = Array.from({ length: rows }, () => new Array(cols).fill(0))

  for (let i = 0; i < rows; i++) d[i][0] = i
  for (let j = 0; j < cols; j++) d[0][j] = j

  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const cost = s[i - 1] === t[j - 1] ? 0 : 1
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + cost,
      )
      if (i > 1 && j > 1 && s[i - 1] === t[j - 2] && s[i - 2] === t[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1)
      }
    }
  }

  return d[rows - 1][cols - 1]
}

/**
 * Совпадает ли ответ игрока с одним из правильных
 * @param {unknown} input - что ввёл игрок
 * @param {unknown|unknown[]} correct - правильный ответ или список ответов
 * @param {{ typos?: boolean }} [options] - typos: false отключает допуск опечаток
 * @returns {boolean}
 */
export function isAnswerCorrect(input, correct, { typos = true } = {}) {
  const given = normalizeAnswer(input)
  if (!given) return false

  const candidates = (Array.isArray(correct) ? correct : [correct])
    .map(normalizeAnswer)
    .filter(Boolean)

  return candidates.some((expected) => {
    if (given === expected) return true
    if (!typos) return false
    if (Array.from(expected).length < MIN_LENGTH_FOR_TYPOS) return false
    if (NUMERIC_RE.test(expected)) return false
    // Быстрый отсев: разница длин больше допуска — точно не подходит
    if (Math.abs(Array.from(given).length - Array.from(expected).length) > MAX_TYPOS) return false
    return editDistance(given, expected) <= MAX_TYPOS
  })
}
