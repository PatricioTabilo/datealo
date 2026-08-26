// @vitest-environment jsdom
import { mount } from '@vue/test-utils'
import { defineComponent, ref } from 'vue'
import { describe, expect, it } from 'vitest'
import CatalogSelect from './CatalogSelect.vue'

// UInput/UButton son de Nuxt UI (auto-importados en la app real, no disponibles fuera de un contexto
// Nuxt) — se stubean con lo mínimo real: un <input> de verdad y un <button> de verdad, porque
// CatalogSelect ya no delega nada de su comportamiento a un componente de combobox — el filtrado, la
// apertura y la selección son 100% propios (ver el comentario en CatalogSelect.vue sobre por qué se
// abandonó el modo combobox de UInputMenu).
//
// Expone `inputRef` igual que el UInput real (node_modules/@nuxt/ui/dist/runtime/components/Input.vue)
// porque CatalogSelect lo usa directo para limpiar el campo al tipear sobre un label ya elegido.
const UInputStub = defineComponent({
  props: ['modelValue', 'placeholder', 'readonly'],
  emits: ['update:modelValue'],
  setup(_props, { expose }) {
    const inputRef = ref<HTMLInputElement | null>(null)
    expose({ inputRef })
    return { inputRef }
  },
  template: `
    <input
      ref="inputRef"
      :value="modelValue"
      :placeholder="placeholder"
      :readonly="readonly"
      @input="$emit('update:modelValue', $event.target.value)"
    />
  `,
})

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
      stubs: { UInput: UInputStub, UButton: UButtonStub },
    },
  })
}

describe('CatalogSelect', () => {
  it('modo enfocado sin texto: no muestra ninguna opción hasta escribir', async () => {
    const wrapper = mountCatalogSelect()
    await wrapper.find('input').trigger('focusin')
    expect(wrapper.find('[data-testid^="option-"]').exists()).toBe(false)
  })

  it('modo con coincidencias: filtra sin distinguir mayúsculas ni tildes, sacando las que no matchean', async () => {
    const wrapper = mountCatalogSelect()
    await wrapper.find('input').trigger('focusin')
    await wrapper.find('input').setValue('electric')

    expect(wrapper.find('[data-testid="option-electricidad"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="option-gasfiteria"]').exists()).toBe(false)
  })

  it('matchea "gasfiteria" escrito sin tilde contra "Gasfitería"', async () => {
    const wrapper = mountCatalogSelect()
    await wrapper.find('input').trigger('focusin')
    await wrapper.find('input').setValue('gasfiteria')
    expect(wrapper.find('[data-testid="option-gasfiteria"]').exists()).toBe(true)
  })

  it('seleccionar una opción emite update:modelValue con su value, nunca con el texto escrito', async () => {
    const wrapper = mountCatalogSelect()
    await wrapper.find('input').trigger('focusin')
    await wrapper.find('input').setValue('gasfi')
    await wrapper.find('[data-testid="option-gasfiteria"]').trigger('click')

    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted).toBeTruthy()
    expect(emitted![0]).toEqual(['gasfiteria'])
  })

  it('seleccionar la opción correcta no emite el value de otra que ya no está en la lista filtrada', async () => {
    const wrapper = mountCatalogSelect()
    await wrapper.find('input').trigger('focusin')
    await wrapper.find('input').setValue('electric')
    await wrapper.find('[data-testid="option-electricidad"]').trigger('click')

    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted![0]).toEqual(['electricidad'])
    expect(emitted![0]).not.toEqual(['gasfiteria'])
  })

  it('escribir texto que no matchea nada no emite ningún valor', async () => {
    const wrapper = mountCatalogSelect()
    await wrapper.find('input').trigger('focusin')
    await wrapper.find('input').setValue('algo que no existe')
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
  })

  it('modo error: el botón "Reintentar" emite retry', async () => {
    const wrapper = mountCatalogSelect({ error: true })
    await wrapper.find('input').trigger('focusin')
    await wrapper.find('input').setValue('a')
    await wrapper.find('[data-testid="retry-button"]').trigger('click')
    expect(wrapper.emitted('retry')).toBeTruthy()
  })

  it('modo cargando: muestra el skeleton, no la lista', async () => {
    const wrapper = mountCatalogSelect({ pending: true })
    await wrapper.find('input').trigger('focusin')
    await wrapper.find('input').setValue('a')
    expect(wrapper.find('[data-testid="loading-skeleton"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid^="option-"]').exists()).toBe(false)
  })

  it('sin showAllOnFocus (comunas): enfocar sin escribir no abre la lista', async () => {
    const wrapper = mountCatalogSelect()
    await wrapper.find('input').trigger('focusin')
    expect(wrapper.find('[data-testid^="option-"]').exists()).toBe(false)
  })

  it('con showAllOnFocus (categorías): enfocar sin escribir muestra el catálogo completo', async () => {
    const wrapper = mountCatalogSelect({ showAllOnFocus: true })
    await wrapper.find('input').trigger('focusin')

    for (const item of items) {
      expect(wrapper.find(`[data-testid="option-${item.value}"]`).exists()).toBe(true)
    }
  })

  it('con showAllOnFocus: al salir sin seleccionar, la lista se vuelve a cerrar', async () => {
    const wrapper = mountCatalogSelect({ showAllOnFocus: true })
    await wrapper.find('input').trigger('focusin')
    await wrapper.find('input').trigger('focusout')
    expect(wrapper.find('[data-testid^="option-"]').exists()).toBe(false)
  })

  it('al reenfocar un campo con selección, sigue mostrando el label elegido (no en blanco)', async () => {
    const wrapper = mountCatalogSelect({ modelValue: 'gasfiteria' })
    expect(wrapper.find('input').element.value).toBe('Gasfitería')
    await wrapper.find('input').trigger('focusin')
    expect(wrapper.find('input').element.value).toBe('Gasfitería')
  })

  // Comportamiento verificado sobre el selector de comuna real de mercadolibre.cl: reenfocar un campo ya
  // elegido no abre la lista ni toca el texto — recién al escribir se abre y filtra.
  it('reenfocar un campo ya elegido no abre la lista (solo abre al escribir)', async () => {
    const wrapper = mountCatalogSelect({ modelValue: 'electricidad' })
    await wrapper.find('input').trigger('focusin')
    expect(wrapper.find('[data-testid^="option-"]').exists()).toBe(false)

    await wrapper.find('input').setValue('gasfi')
    expect(wrapper.find('[data-testid="option-gasfiteria"]').exists()).toBe(true)
  })

  it('con una selección hecha, la lista no queda filtrada por su propio label', async () => {
    const wrapper = mountCatalogSelect({ modelValue: 'electricidad', showAllOnFocus: true })
    await wrapper.find('input').trigger('focusin')

    // Sin esto, el campo filtraría por "Electricidad" y mostraría una lista de un solo elemento,
    // dejando sin salida a quien quiere cambiar de opción.
    for (const item of items) {
      expect(wrapper.find(`[data-testid="option-${item.value}"]`).exists()).toBe(true)
    }
  })

  it('salir sin elegir descarta el texto a medio escribir y restaura el label elegido', async () => {
    const wrapper = mountCatalogSelect({ modelValue: 'electricidad' })
    await wrapper.find('input').trigger('focusin')
    await wrapper.find('input').setValue('texto suelto')
    await wrapper.find('input').trigger('focusout')

    expect(wrapper.find('input').element.value).toBe('Electricidad')
  })

  it('salir sin elegir y sin selección previa deja el campo vacío, no el texto suelto', async () => {
    const wrapper = mountCatalogSelect()
    await wrapper.find('input').trigger('focusin')
    await wrapper.find('input').setValue('texto suelto')
    await wrapper.find('input').trigger('focusout')

    expect(wrapper.find('input').element.value).toBe('')
  })

  it('seleccionar una opción no dispara focusout (click dentro del propio contenedor)', async () => {
    const wrapper = mountCatalogSelect()
    await wrapper.find('input').trigger('focusin')
    await wrapper.find('input').setValue('gasfi')
    // focusout con relatedTarget apuntando a la opción, como pasaría en un browser real al clickearla
    const option = wrapper.find('[data-testid="option-gasfiteria"]').element
    await wrapper.find('input').trigger('focusout', { relatedTarget: option })
    await wrapper.find('[data-testid="option-gasfiteria"]').trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['gasfiteria'])
  })
})
