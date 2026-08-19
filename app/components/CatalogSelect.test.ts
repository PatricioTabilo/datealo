// @vitest-environment jsdom
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import CatalogSelect from './CatalogSelect.vue'

// UInputMenu es de Nuxt UI (auto-importado en la app real, no disponible fuera de un contexto Nuxt) —
// se stubea con algo mínimo que expone lo que CatalogSelect necesita: v-model, search-term y el slot
// `#item` por cada elemento de `items` (CatalogSelect siempre le pasa el catálogo completo, sin
// recortar — ver T-004/T-005 y el comentario en CatalogSelect.vue sobre por qué). Lo que se prueba
// acá es la lógica de CatalogSelect (qué se ve, qué se emite), no el comportamiento interno de
// UInputMenu, que es de Nuxt UI y no de este componente.
const UInputMenuStub = {
  props: ['modelValue', 'searchTerm', 'items', 'open', 'loading', 'disabled', 'placeholder'],
  emits: ['update:modelValue', 'update:searchTerm', 'focus', 'blur'],
  template: `
    <div>
      <input
        :value="searchTerm"
        @input="$emit('update:searchTerm', $event.target.value)"
        @focus="$emit('focus')"
        @blur="$emit('blur')"
      />
      <div v-if="open" data-testid="dropdown">
        <slot v-for="item in items" :key="item.value" name="item" :item="item" />
        <slot name="content-bottom" />
      </div>
    </div>
  `,
}

const UButtonStub = {
  props: ['size'],
  emits: ['click'],
  template: '<button v-bind="$attrs" @click="$emit(\'click\')"><slot /></button>',
  inheritAttrs: false,
}

const items = [
  { value: 'gasfiteria', label: 'Gasfitería' },
  { value: 'electricidad', label: 'Electricidad' },
  { value: 'jardineria', label: 'Jardinería' },
]

function mountCatalogSelect(props: Partial<InstanceType<typeof CatalogSelect>['$props']> = {}) {
  return mount(CatalogSelect, {
    props: {
      items,
      pending: false,
      error: false,
      placeholder: '¿Qué necesitas?',
      errorMessage: 'No pudimos cargar el catálogo.',
      ...props,
    },
    global: {
      stubs: { UInputMenu: UInputMenuStub, UButton: UButtonStub },
    },
  })
}

describe('CatalogSelect', () => {
  it('modo enfocado sin texto: no muestra ninguna opción hasta escribir', async () => {
    const wrapper = mountCatalogSelect()
    expect(wrapper.find('[data-testid="dropdown"]').exists()).toBe(false)
  })

  it('modo con coincidencias: filtra sin distinguir mayúsculas ni tildes, sin sacar el resto del DOM', async () => {
    const wrapper = mountCatalogSelect()
    await wrapper.find('input').setValue('electric')

    const match = wrapper.find('[data-testid="option-electricidad"]')
    const nonMatch = wrapper.find('[data-testid="option-gasfiteria"]')
    expect(match.isVisible()).toBe(true)
    // Sigue en el árbol (nunca se saca del array — ver comentario de CatalogSelect.vue), solo oculto.
    expect(nonMatch.exists()).toBe(true)
    expect(nonMatch.isVisible()).toBe(false)
  })

  it('matchea "gasfiteria" escrito sin tilde contra "Gasfitería"', async () => {
    const wrapper = mountCatalogSelect()
    await wrapper.find('input').setValue('gasfiteria')
    expect(wrapper.find('[data-testid="option-gasfiteria"]').isVisible()).toBe(true)
  })

  it('seleccionar una opción emite update:modelValue con su value, nunca con el texto escrito', async () => {
    const wrapper = mountCatalogSelect()
    await wrapper.find('input').setValue('gasfi')
    await wrapper.find('[data-testid="option-gasfiteria"]').trigger('click')

    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted).toBeTruthy()
    expect(emitted![0]).toEqual(['gasfiteria'])
  })

  it('seleccionar la opción correcta no emite el value de otra, aunque esté oculta en el mismo array', async () => {
    const wrapper = mountCatalogSelect()
    await wrapper.find('input').setValue('electric')
    await wrapper.find('[data-testid="option-electricidad"]').trigger('click')

    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted![0]).toEqual(['electricidad'])
    expect(emitted![0]).not.toEqual(['gasfiteria'])
  })

  it('escribir texto que no matchea nada no emite ningún valor', async () => {
    const wrapper = mountCatalogSelect()
    await wrapper.find('input').setValue('algo que no existe')
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
  })

  it('modo error: el botón "Reintentar" emite retry', async () => {
    const wrapper = mountCatalogSelect({ error: true })
    await wrapper.find('input').setValue('a')
    await wrapper.find('[data-testid="retry-button"]').trigger('click')
    expect(wrapper.emitted('retry')).toBeTruthy()
  })

  it('sin showAllOnFocus (comunas): enfocar sin escribir no abre la lista', async () => {
    const wrapper = mountCatalogSelect()
    await wrapper.find('input').trigger('focus')
    expect(wrapper.find('[data-testid="dropdown"]').exists()).toBe(false)
  })

  it('con showAllOnFocus (categorías): enfocar sin escribir muestra el catálogo completo', async () => {
    const wrapper = mountCatalogSelect({ showAllOnFocus: true })
    await wrapper.find('input').trigger('focus')

    expect(wrapper.find('[data-testid="dropdown"]').exists()).toBe(true)
    for (const item of items) {
      expect(wrapper.find(`[data-testid="option-${item.value}"]`).isVisible()).toBe(true)
    }
  })

  it('con showAllOnFocus: al salir sin seleccionar, la lista se vuelve a cerrar', async () => {
    const wrapper = mountCatalogSelect({ showAllOnFocus: true })
    await wrapper.find('input').trigger('focus')
    await wrapper.find('input').trigger('blur')
    expect(wrapper.find('[data-testid="dropdown"]').exists()).toBe(false)
  })
})
