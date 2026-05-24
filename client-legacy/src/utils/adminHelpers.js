export const formatRub  = (v) => v ? `${Math.round(Number(v) / 100).toLocaleString('ru')} ₽` : '—'
export const formatDate = (d) => d ? new Date(d).toLocaleDateString('ru', { day: 'numeric', month: 'short' }) : '—'
export const statusLabel = (s) => ({ pending: 'Новый', confirmed: 'Подтверждён', in_progress: 'В работе', completed: 'Выполнен', cancelled: 'Отменён' }[s] || s)