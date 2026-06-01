// questAssembler — чистая детерминированная сборка квеста (Фаза 2, 2.4.2).
//
// Превращает structure шаблона (quest_templates.structure) + ответы
// опросника заказчика в готовые blocks (created_quests.blocks).
// БЕЗ вызовов LLM: вся «персонализация» — детерминированная подстановка
// в слоты. Маппинг и принцип «двух авторов» — см. docs/upgrade-plan.md §2.4.0.
//
// Принцип:
//   • simple.description, riddle.{answer,hint}, mini_game.{game_options,
//     game_correct}, block.location → заполняются ответами ЗАКАЗЧИКА
//     (ключ answers[task.id] / answers[block.id]);
//   • text_answer, selfie → НЕ трогаются (адресованы игроку, без секретов);
//   • {partner}/{author} → подставляются в текстовые поля.
//
// Чистая функция: один вход → один выход, без side-effects. Тестируема.

/** Подстановка переменных имён в строку. Не-строки возвращаются как есть. */
function applyVars(value, meta) {
  if (typeof value !== 'string') return value
  return value
    .replace(/\{partner\}/g, meta.partner_name || '')
    .replace(/\{author\}/g, meta.author_name || '')
}

/** Сборка одной задачи по её типу. */
function assembleTask(task, answers, meta) {
  const a = answers[task.id] || {}
  const out = { ...task }
  out.title = applyVars(task.title, meta)
  out.description = applyVars(task.description, meta)

  switch (task.type) {
    case 'simple':
      // заказчик указывает, КУДА спрятать подсказку
      if (a.hiding_spot != null) out.description = a.hiding_spot
      break
    case 'riddle':
      // вопрос из шаблона (параметризуем), ответ — секрет заказчика
      out.question = applyVars(task.question, meta)
      if (a.answer != null) out.answer = a.answer
      if (a.hint != null) out.hint = a.hint
      break
    case 'mini_game':
      out.game_question = applyVars(task.game_question, meta)
      if (Array.isArray(a.options)) out.game_options = a.options
      if (a.correct != null) out.game_correct = a.correct
      break
    case 'text_answer':
    case 'selfie':
      // шаблонные, адресованы игроку — оставляем как есть (только {vars})
      break
    default:
      // неизвестный тип → copy-through (forward-safe для будущих типов)
      break
  }
  return out
}

/**
 * @param {Array}  structure — quest_templates.structure (массив блоков)
 * @param {Object} answers   — { [block.id|task.id]: {...поля} }
 * @param {Object} meta      — { partner_name, author_name }
 * @returns {Array} blocks для created_quests.blocks
 * @throws  если structure не массив
 */
export function questAssembler(structure, answers = {}, meta = {}) {
  if (!Array.isArray(structure)) {
    throw new Error('questAssembler: structure must be an array')
  }
  return structure.map((block) => {
    const ba = answers[block.id] || {}
    return {
      ...block,
      title: applyVars(block.title, meta),
      description: applyVars(block.description, meta),
      location: ba.location != null ? ba.location : block.location,
      tasks: (block.tasks || []).map((t) => assembleTask(t, answers, meta)),
    }
  })
}