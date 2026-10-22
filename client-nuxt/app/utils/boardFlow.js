// Порядок прохождения «доска» (created_quests.flow = 'board'): все участки
// открыты сразу, игрок выбирает сам. Последний участок — финал: он открывается,
// когда пройдены все остальные. Участок без заданий финал не запирает.

export const isBoardFlow = (quest) =>
  quest?.flow === 'board' && (quest.blocks?.length ?? 0) > 1

export const isBlockDone = (block, completedIds) => {
  const tasks = block?.tasks ?? []
  return tasks.length > 0 && tasks.every(t => completedIds.includes(t.id))
}

export const finalIndex = (blocks) => blocks.length - 1

// улики — все участки кроме финала, у которых есть задания
const clues = (blocks) => blocks.slice(0, -1).filter(b => b.tasks?.length)

export const cluesDone = (blocks, completedIds) =>
  clues(blocks).filter(b => isBlockDone(b, completedIds)).length

export const cluesTotal = (blocks) => clues(blocks).length

export const finalUnlocked = (blocks, completedIds) =>
  cluesDone(blocks, completedIds) === cluesTotal(blocks)

export const canOpenBlock = (i, blocks, completedIds) => {
  if (i < 0 || i >= blocks.length) return false
  return i !== finalIndex(blocks) || finalUnlocked(blocks, completedIds)
}
