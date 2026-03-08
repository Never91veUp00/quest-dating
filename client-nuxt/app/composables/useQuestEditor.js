// composables/useQuestEditor.js
// Nuxt 4 версия: apiClient → useApi(), localStorage → useCookie, useRouter/useRoute — авто

export function useQuestEditor() {
  const router = useRouter()
  const route  = useRoute()
  const { get, post, put } = useApi()

  const isEdit = computed(() => !!route.params.id)
  const origin = import.meta.client ? window.location.origin : ''

  // ─── Form ─────────────────────────────────────────────────────
  const form = ref({
    title: '', client_name: '', slug: '', theme: 'detective',
    show_intro: true, access_code: '', final_message: '',
    is_public: false, order_id: null, template_id: null, blocks: []
  })

  const saving           = ref(false)
  const errors           = ref([])
  const openBlocks       = ref([])
  const templates        = ref([])
  const selectedTemplate = ref('')
  const toast            = ref(null)
  let   toastTimer       = null

  // ─── Init ────────────────────────────────────────────────────
  onMounted(async () => {
    try {
      const res = await get('/admin/templates')
      templates.value = res?.data ?? res ?? []
    } catch {}

    if (isEdit.value) {
      try {
        const res = await get(`/admin/quests/${route.params.id}`)
        const q = res?.data ?? res
        form.value = {
          title: q.title, client_name: q.client_name, slug: q.slug,
          theme: q.theme || 'detective', show_intro: q.show_intro !== false,
          access_code: q.access_code || '', final_message: q.final_message || '',
          is_public: q.is_public, order_id: q.order_id,
          template_id: q.template_id, blocks: q.blocks || []
        }
        if (form.value.blocks.length) openBlocks.value = [form.value.blocks[0].id]
      } catch {
        showToast('Квест не найден', 'error')
        router.push('/admin')
      }
      return
    }

    if (route.query.client_name) {
      form.value.client_name = route.query.client_name
      form.value.order_id    = route.query.order_id    ? Number(route.query.order_id)    : null
      form.value.template_id = route.query.template_id ? Number(route.query.template_id) : null
      autoSlug()
    }

    if (form.value.template_id && templates.value.length) {
      const tpl = templates.value.find(t => t.id === Number(form.value.template_id))
      if (tpl) { selectedTemplate.value = tpl; applyTemplate(tpl) }
    }

    if (!form.value.blocks.length) addBlock()
  })

  // ─── Slug ─────────────────────────────────────────────────────
  const cyrillicToLatin = (str) => {
    const map = {
      а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'yo',ж:'zh',з:'z',и:'i',й:'y',
      к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'h',
      ц:'ts',ч:'ch',ш:'sh',щ:'sch',ъ:'',ы:'y',ь:'',э:'e',ю:'yu',я:'ya'
    }
    return str.split('').map(c => map[c] || c).join('')
  }

  const autoSlug = () => {
    if (isEdit.value) return
    const name = form.value.client_name
      .toLowerCase().replace(/[^a-zа-яё0-9\s]/gi, '').trim().replace(/\s+/g, '-')
    const translit = cyrillicToLatin(name)
    const rand = Math.floor(Math.random() * 900 + 100)
    form.value.slug = translit ? `${translit}-${new Date().getFullYear()}-${rand}` : ''
    if (!form.value.title && form.value.client_name)
      form.value.title = `Квест для ${form.value.client_name}`
  }

  // ─── Templates ────────────────────────────────────────────────
  const loadTemplate = () => {
    if (!selectedTemplate.value) return
    const hasContent = form.value.blocks.length > 1 ||
      (form.value.blocks.length === 1 && form.value.blocks[0].tasks.length)
    if (hasContent && !confirm('Заменить текущие блоки блоками шаблона?')) {
      selectedTemplate.value = ''; return
    }
    applyTemplate(selectedTemplate.value)
  }

  const applyTemplate = (tpl) => {
    let blocks = []
    if (tpl.structure) {
      let raw = tpl.structure
      if (typeof raw === 'string') { try { raw = JSON.parse(raw) } catch { raw = null } }
      if (Array.isArray(raw)) {
        blocks = raw
      } else if (raw && Array.isArray(raw.phases) && raw.phases.length) {
        blocks = raw.phases.map(p => ({
          id: '', title: p.title || '', description: p.description || '', location: '',
          tasks: (p.items || []).map(item => ({
            id: '', type: 'simple', title: item.text || '', description: '', points: 10, hint: ''
          }))
        }))
      }
    }
    if (!blocks.length) blocks = [{ id: '', title: '', description: '', location: '', tasks: [] }]
    blocks = JSON.parse(JSON.stringify(blocks))
    blocks.forEach((b, bi) => {
      b.id = `block-${Date.now()}-${bi}`
      b.tasks = (b.tasks || []).map((t, ti) => ({ ...t, id: `task-${Date.now()}-${bi}-${ti}` }))
    })
    form.value.blocks = blocks
    form.value.template_id = tpl.id
    openBlocks.value = [blocks[0].id]
  }

  // ─── Blocks ───────────────────────────────────────────────────
  const addBlock = () => {
    const id = `block-${Date.now()}`
    form.value.blocks.push({ id, title: '', description: '', location: '', tasks: [] })
    openBlocks.value = [id]
  }
  const removeBlock = (idx) => {
    if (!confirm('Удалить этот блок?')) return
    const id = form.value.blocks[idx].id
    form.value.blocks.splice(idx, 1)
    openBlocks.value = openBlocks.value.filter(x => x !== id)
  }
  const moveBlock = (idx, dir) => {
    const arr = form.value.blocks, to = idx + dir
    if (to < 0 || to >= arr.length) return
    ;[arr[idx], arr[to]] = [arr[to], arr[idx]]
  }
  const toggleBlock = (id) => {
    openBlocks.value = openBlocks.value.includes(id)
      ? openBlocks.value.filter(x => x !== id)
      : [...openBlocks.value, id]
  }

  // ─── Tasks ────────────────────────────────────────────────────
  const TASK_DEFAULTS = {
    simple:        { points: 10,  hint: '' },
    riddle:        { points: 30,  question: '', answer: '', hint: '' },
    code_physical: { points: 30,  answer: '', code_hint: '', hint: '' },
    location:      { points: 15,  location_desc: '', location_hint: '' },
    selfie:        { points: 25,  selfie_condition: '', selfie_emoji: '🤳' },
    photo:         { points: 20,  instruction: '' },
    text_answer:   { points: 15,  question: '', placeholder: '' },
    media:         { points: 10,  media_type: 'telegram_video', media_url: '' },
    qr:            { points: 35,  answer: '', qr_instruction: '', qr_preview: null },
    mini_game:     { points: 40,  game_type: 'quiz', game_question: '',
                     game_options: ['','','',''], game_correct: 0,
                     game_images: [], puzzle_image: null, puzzle_pieces: 30 },
  }

  const addTask    = (block, type) => block.tasks.push({
    id: `task-${Date.now()}`, type, title: '', description: '',
    ...(TASK_DEFAULTS[type] || {})
  })
  const removeTask = (block, idx) => block.tasks.splice(idx, 1)
  const moveTask   = (block, idx, dir) => {
    const arr = block.tasks, to = idx + dir
    if (to < 0 || to >= arr.length) return
    ;[arr[idx], arr[to]] = [arr[to], arr[idx]]
  }

  // ─── QR ───────────────────────────────────────────────────────
  const generateQR = (task) => {
    task.qr_preview = `https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${encodeURIComponent(task.answer)}&choe=UTF-8`
  }

  // ─── Pairs ────────────────────────────────────────────────────
  const addPairImage    = (task, imageUrl) => { task.game_images = [...(task.game_images || []), imageUrl] }
  const removePairImage = (task, idx)      => task.game_images.splice(idx, 1)

  // ─── Validation ───────────────────────────────────────────────
  const validate = () => {
    const errs = []
    if (!form.value.client_name.trim()) errs.push('Укажи имя клиента')
    if (!form.value.title.trim())       errs.push('Укажи название квеста')
    if (!form.value.slug.trim())        errs.push('Укажи slug')
    if (!form.value.blocks.length)      errs.push('Добавь хотя бы один блок')
    form.value.blocks.forEach((b, bi) => {
      if (!b.title.trim()) errs.push(`Блок ${bi + 1}: укажи название`)
      b.tasks.forEach((t, ti) => {
        if (!t.title.trim()) errs.push(`Блок ${bi + 1}, задание ${ti + 1}: укажи заголовок`)
        if (t.type === 'riddle' && !t.answer?.trim())
          errs.push(`Блок ${bi + 1}, задание ${ti + 1}: укажи правильный ответ`)
      })
    })
    return errs
  }

  // ─── Toast ────────────────────────────────────────────────────
  const showToast = (msg, type = 'info') => {
    if (toastTimer) clearTimeout(toastTimer)
    toast.value = { msg, type }
    toastTimer = setTimeout(() => { toast.value = null }, 4000)
  }

  // ─── Save ─────────────────────────────────────────────────────
  const scrollToErrors = () => setTimeout(() =>
    document.querySelector('.qe-errors')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100)

  const save = async (publish) => {
    errors.value = []
    if (publish) {
      errors.value = validate()
      if (errors.value.length) { scrollToErrors(); return }
    } else {
      if (!form.value.client_name.trim()) { errors.value = ['Укажи имя клиента']; return }
      if (!form.value.title.trim())       { errors.value = ['Укажи название квеста']; return }
      if (!form.value.slug.trim()) autoSlug()
    }

    saving.value = true
    try {
      const payload = { ...form.value, is_public: publish }
      const res = isEdit.value
        ? await put(`/admin/quests/${route.params.id}`, payload)
        : await post('/admin/quests', payload)
      const saved = res?.data ?? res
      form.value.slug = saved.slug

      if (publish) {
        const url = `${origin}/quest/${saved.slug}`
        await navigator.clipboard.writeText(url).catch(() => {})
        showToast(`✅ Опубликован! Ссылка скопирована: ${url}`, 'success')
      } else {
        showToast('💾 Черновик сохранён', 'info')
      }
      if (!isEdit.value) router.replace(`/admin/quest/${saved.id}/edit`)

    } catch (e) {
      if (e.status === 409 && e.existing_id) { router.replace(`/admin/quest/${e.existing_id}/edit`); return }
      if (e.status === 409) errors.value = ['Квест с таким slug уже существует']
      else if (Array.isArray(e.errors)) errors.value = e.errors.map(x => x.msg || String(x))
      else errors.value = [e.message || 'Ошибка сохранения']
      scrollToErrors()
    } finally {
      saving.value = false
    }
  }

  const previewQuest = () => {
    const previewData = {
      id: form.value.id || 0,
      title: form.value.title,
      client_name: form.value.client_name,
      slug: form.value.slug,
      theme: form.value.theme,
      show_intro: form.value.show_intro,
      final_message: form.value.final_message,
      blocks: form.value.blocks,
      is_public: form.value.is_public,
    }
    try { sessionStorage.setItem('quest_preview', JSON.stringify(previewData)) } catch {}
    window.open(`/quest/${form.value.slug}?preview=1`, '_blank')
  }

  return {
    form, saving, errors, openBlocks, templates, selectedTemplate, toast, isEdit, origin,
    addBlock, removeBlock, moveBlock, toggleBlock,
    addTask, removeTask, moveTask,
    generateQR, addPairImage, removePairImage,
    loadTemplate, autoSlug,
    save, previewQuest, showToast,
  }
}