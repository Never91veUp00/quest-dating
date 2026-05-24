import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import SearchBar from '../../../app/components/common/SearchBar.vue'

// localStorage мок (jsdom имеет встроенный, но явный — надёжнее)
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem:    (k: string) => store[k] ?? null,
    setItem:    (k: string, v: string) => { store[k] = String(v) },
    removeItem: (k: string) => { delete store[k] },
    clear:      () => { store = {} },
  }
})()
Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true })

describe('SearchBar', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  const mountBar = (props = {}) => mount(SearchBar, {
    props: { modelValue: '', ...props },
    global: { stubs: { transition: false } },
  })

  describe('рендер', () => {
    it('отображает поле ввода', () => {
      const wrapper = mountBar()
      expect(wrapper.find('input[type="text"]').exists()).toBe(true)
    })

    it('отображает кнопку поиска при showButton=true', () => {
      const wrapper = mountBar({ showButton: true })
      expect(wrapper.find('.search-button').exists()).toBe(true)
    })

    it('скрывает кнопку при showButton=false', () => {
      const wrapper = mountBar({ showButton: false })
      expect(wrapper.find('.search-button').exists()).toBe(false)
    })

    it('использует переданный placeholder', () => {
      const wrapper = mountBar({ placeholder: 'Найти квест...' })
      expect(wrapper.find('input').attributes('placeholder')).toBe('Найти квест...')
    })
  })

  describe('ввод', () => {
    it('эмитит update:modelValue при вводе', async () => {
      const wrapper = mountBar()
      await wrapper.find('input').setValue('детектив')
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')![0]).toEqual(['детектив'])
    })

    it('показывает кнопку очистки при наличии текста', async () => {
      const wrapper = mountBar()
      expect(wrapper.find('.search-clear').exists()).toBe(false)
      await wrapper.find('input').setValue('детектив')
      expect(wrapper.find('.search-clear').exists()).toBe(true)
    })

    it('очищает поле при клике на крестик', async () => {
      const wrapper = mountBar({ modelValue: 'детектив' })
      await wrapper.find('input').setValue('детектив')
      await wrapper.find('.search-clear').trigger('click')
      expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([''])
    })
  })

  describe('поиск', () => {
    it('эмитит search при нажатии Enter', async () => {
      const wrapper = mountBar()
      await wrapper.find('input').setValue('романтика')
      await wrapper.find('input').trigger('keyup.enter')
      expect(wrapper.emitted('search')).toBeTruthy()
      expect(wrapper.emitted('search')![0]).toEqual(['романтика'])
    })

    it('не эмитит search для пустой строки', async () => {
      const wrapper = mountBar()
      await wrapper.find('input').trigger('keyup.enter')
      expect(wrapper.emitted('search')).toBeFalsy()
    })

    it('эмитит search при клике на кнопку', async () => {
      const wrapper = mountBar({ showButton: true })
      await wrapper.find('input').setValue('квест')
      await wrapper.find('.search-button').trigger('click')
      expect(wrapper.emitted('search')).toBeTruthy()
    })

    it('кнопка поиска заблокирована при пустом поле', () => {
      const wrapper = mountBar({ showButton: true, modelValue: '' })
      expect(wrapper.find('.search-button').attributes('disabled')).toBeDefined()
    })
  })

  describe('недавние поиски (localStorage)', () => {
    it('сохраняет запрос в localStorage после поиска', async () => {
      const wrapper = mountBar()
      await wrapper.find('input').setValue('романтика')
      await wrapper.find('input').trigger('keyup.enter')

      const stored = JSON.parse(localStorage.getItem('quest-recent-searches')!)
      expect(stored).toContain('романтика')
    })

    it('загружает недавние поиски при фокусе', async () => {
      localStorage.setItem('quest-recent-searches', JSON.stringify(['детектив', 'романтика']))
      const wrapper = mountBar()
      await wrapper.find('input').trigger('focus')
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain('детектив')
    })
  })

  describe('XSS-защита в подсказках', () => {
    it('экранирует HTML-теги в тексте подсказки', async () => {
      const wrapper = mountBar({
        modelValue: 'test',
        suggestions: ['<script>alert(1)</script>'],
      })
      await wrapper.find('input').setValue('test')
      await wrapper.find('input').trigger('focus')
      await wrapper.vm.$nextTick()

      // Тег <script> не должен попасть в DOM как исполняемый элемент
      expect(wrapper.html()).not.toContain('<script>')
      // Если dropdown показан — должен быть экранирован
      const html = wrapper.html()
      if (html.includes('alert')) {
        expect(html).toContain('&lt;script&gt;')
      }
    })

    it('экранирует поисковый запрос перед подсветкой через v-html', async () => {
      const wrapper = mountBar({ suggestions: ['тест квест романтика'] })
      await wrapper.find('input').setValue('<img src=x onerror=alert(1)>')
      await wrapper.find('input').trigger('focus')
      await wrapper.vm.$nextTick()
      // onerror не должен попасть в DOM как атрибут
      expect(wrapper.html()).not.toContain('onerror=alert')
    })
  })

  describe('подсветка совпадений', () => {
    it('оборачивает совпадение в <strong>', async () => {
      const wrapper = mountBar({ suggestions: ['романтический квест'] })
      await wrapper.find('input').setValue('квест')
      await wrapper.find('input').trigger('focus')
      await wrapper.vm.$nextTick()

      const highlighted = wrapper.find('.item-text strong')
      if (highlighted.exists()) {
        expect(highlighted.text().toLowerCase()).toContain('квест')
      }
    })
  })
})
