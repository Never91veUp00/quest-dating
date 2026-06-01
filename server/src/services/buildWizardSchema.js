// buildWizardSchema — чистая детерминированная функция (Фаза 2, 2.4.1).
//
// Парная к questAssembler: ассемблер кладёт ответы в слоты, эта —
// выводит из шаблона СПИСОК вопросов опросника по заполняемым слотам.
// Вместе они образуют детерминированный путь order → blocks без LLM.
//
// Вход:  template — строка quest_templates ({ structure, location_type, ... })
// Выход: { meta: [...глобальные вопросы], questions: [...по слотам] }
//
// Принцип (см. docs/upgrade-plan.md §2.4.0): спрашиваем у ЗАКАЗЧИКА только
// то, что физически знает он один:
//   • simple        → куда спрятать подсказку (key: hiding_spot)
//   • riddle        → секретный ответ + подсказка (keys: answer, hint)
//   • mini_game     → варианты + индекс верного (keys: options, correct)
//   • block.location → только для city-шаблонов (indoor — квест дома, не нужно)
//   • text_answer / selfie → НЕ спрашиваем (адресованы игроку, шаблонные)
//
// Ключ ответа (`answer_key`) совпадает с тем, что ждёт questAssembler:
//   answers[task.id] = { hiding_spot | answer,hint | options,correct }
//   answers[block.id] = { location }

/** Глобальные вопросы — задаются один раз в начале опросника. */
function metaQuestions() {
  return [
    { key: 'partner_name', input: 'text', required: true, label: 'Имя того, кому дарите квест' },
    { key: 'author_name', input: 'text', required: false, label: 'Ваше имя (для подписи)' },
    { key: 'event_date', input: 'date', required: false, label: 'Дата события' },
    { key: 'final_message', input: 'textarea', required: false, label: 'Личное послание на финальном экране' },
  ]
}

/** Вопросы по одной задаче. Возвращает массив (0..n вопросов). */
function questionsForTask(task, blockTitle) {
  const base = { block_title: blockTitle, task_id: task.id, task_title: task.title }
  switch (task.type) {
    case 'simple':
      return [{
        ...base, scope: 'task', answer_key: 'hiding_spot', input: 'text', required: true,
        label: `Куда спрятать подсказку: «${task.title}»?`,
        hint: task.description || null, // шаблонная подсказка-пример
      }]
    case 'riddle':
      return [{
        ...base, scope: 'task', answer_key: 'answer', input: 'text', required: true,
        label: task.question || `Ответ на загадку: «${task.title}»`,
        hint: task.description || null,
      }, {
        ...base, scope: 'task', answer_key: 'hint', input: 'text', required: false,
        label: `Подсказка к загадке (необязательно): «${task.title}»`,
      }]
    case 'mini_game':
      return [{
        ...base, scope: 'task', answer_key: 'options', input: 'options_list', required: true,
        label: task.game_question || `Варианты ответа: «${task.title}»`,
        min_options: 2,
      }, {
        ...base, scope: 'task', answer_key: 'correct', input: 'option_index', required: true,
        label: `Какой вариант верный? «${task.title}»`,
      }]
    case 'text_answer':
    case 'selfie':
      return [] // адресовано игроку — опросник не спрашивает
    default:
      return [] // неизвестный тип — не генерируем вопросов (forward-safe)
  }
}

/**
 * @param {Object} template — { structure: Array, location_type?: string }
 * @returns {{ meta: Array, questions: Array }}
 * @throws если structure не массив
 */
export function buildWizardSchema(template) {
  if (!template || !Array.isArray(template.structure)) {
    throw new Error('buildWizardSchema: template.structure must be an array')
  }
  const isCity = template.location_type === 'city'
  const questions = []

  for (const block of template.structure) {
    // location-вопрос — только для городских шаблонов
    if (isCity) {
      questions.push({
        scope: 'block', block_id: block.id, block_title: block.title,
        answer_key: 'location', input: 'text', required: true,
        label: `Где проходит этап «${block.title}»?`,
      })
    }
    for (const task of block.tasks || []) {
      questions.push(...questionsForTask(task, block.title))
    }
  }

  return { meta: metaQuestions(), questions }
}