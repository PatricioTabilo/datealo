// @vitest-environment jsdom
import { defineComponent, nextTick, ref } from 'vue'
import type { Ref } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useSlowLoad } from './useSlowLoad'

function mountUseSlowLoad(pending: Ref<boolean>, ms?: number) {
  let slow!: ReturnType<typeof useSlowLoad>
  const wrapper = mount(defineComponent({
    setup() {
      slow = useSlowLoad(pending, ms)
      return {}
    },
    template: '<div />',
  }))
  return { wrapper, slow }
}

describe('useSlowLoad', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('activa slow si pending sigue en true después de ms', () => {
    const pending = ref(true)
    const { slow } = mountUseSlowLoad(pending, 1000)

    expect(slow.value).toBe(false)
    vi.advanceTimersByTime(1000)
    expect(slow.value).toBe(true)
  })

  it('no activa slow si pending vuelve a false antes de ms', async () => {
    const pending = ref(true)
    const { slow } = mountUseSlowLoad(pending, 1000)

    vi.advanceTimersByTime(500)
    pending.value = false
    await nextTick()
    vi.advanceTimersByTime(1000)

    expect(slow.value).toBe(false)
  })

  it('desmontar el componente no deja ningún timer pendiente', () => {
    const pending = ref(true)
    const { wrapper } = mountUseSlowLoad(pending, 1000)

    expect(vi.getTimerCount()).toBeGreaterThan(0)
    wrapper.unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
})
