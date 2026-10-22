// Иконка типа задания (QuestIcon): на карточке задания и на доске улик
export const TASK_ICON = {
  simple:        'task',
  riddle:        'riddle',
  code_physical: 'code',
  location:      'location',
  selfie:        'selfie',
  photo:         'photo',
  text_answer:   'text',
  media:         'media',
  qr:            'qr',
  mini_game:     'game',
}

export const taskIcon = (type) => TASK_ICON[type] || 'task'
