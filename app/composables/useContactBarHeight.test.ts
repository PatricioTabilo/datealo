// @vitest-environment jsdom
import { defineComponent, ref } from 'vue'
import type { Ref } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { useContactBarHeight } from './useContactBarHeight'

// jsdom no implementa ResizeObserver — este stub deja disparar el callback a mano con la altura que cada
// test necesite, en vez de depender de un resize real que jsdom no puede producir.
class FakeResizeObserver {
  static instances: FakeResizeObserver[] = []
  observed: Element[] = []

  constructor(private callback: (entries: [{ contentRect: { height: number } }]) => void) {
    FakeResizeObserver.instances.push(this)
  }

  observe(el: Element) {
    this.observed.push(el)
  }

  unobserve(el: Element) {
    this.observed = this.observed.filter(observed => observed !== el)
  }

  disconnect() {
    this.observed = []
  }

  trigger(height: number) {
    this.callback([{ contentRect: { height } }])
  }
}

function mountUseContactBarHeight(barRef: Ref<HTMLElement | null>) {
  return mount(defineComponent({
    setup() {
      useContactBarHeight(barRef)
      return {}
    },
    template: '<div />',
  }))
}

describe('useContactBarHeight', () => {
  beforeEach(() => {
    FakeResizeObserver.instances = []
    // @ts-expect-error stub deliberadamente más chico que el ResizeObserver real del navegador
    globalThis.ResizeObserver = FakeResizeObserver
    document.documentElement.style.removeProperty('--contact-bar-h')
  })

  afterEach(() => {
    document.documentElement.style.removeProperty('--contact-bar-h')
  })

  it('con barRef en null, no observa nada ni escribe la variable CSS', () => {
    mountUseContactBarHeight(ref(null))

    expect(FakeResizeObserver.instances[0]?.observed).toHaveLength(0)
    expect(document.documentElement.style.getPropertyValue('--contact-bar-h')).toBe('')
  })

  it('con un elemento observado, publica su alto real en --contact-bar-h', () => {
    const el = document.createElement('div')
    mountUseContactBarHeight(ref(el))

    FakeResizeObserver.instances[0]?.trigger(84)

    expect(document.documentElement.style.getPropertyValue('--contact-bar-h')).toBe('84px')
  })

  it('al desmontar, limpia la variable CSS', () => {
    const el = document.createElement('div')
    const wrapper = mountUseContactBarHeight(ref(el))
    FakeResizeObserver.instances[0]?.trigger(84)

    wrapper.unmount()

    expect(document.documentElement.style.getPropertyValue('--contact-bar-h')).toBe('')
  })
})
