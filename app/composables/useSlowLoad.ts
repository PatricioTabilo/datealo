import { onUnmounted, ref, watch } from 'vue'
import type { Ref } from 'vue'

const DEFAULT_SLOW_MS = 10_000

// ref/watch/onUnmounted importados explícitos, y typeof window en vez de import.meta.client: así se
// puede testear con Vitest + vi.useFakeTimers() sin levantar un contexto de Nuxt completo — mismo
// criterio que CatalogSelect.vue.
export function useSlowLoad(pending: Ref<boolean>, ms = DEFAULT_SLOW_MS): Ref<boolean> {
  const slow = ref(false)
  let timer: ReturnType<typeof setTimeout> | undefined

  function clearSlowTimer() {
    if (timer) clearTimeout(timer)
    timer = undefined
  }

  watch(pending, (isPending) => {
    clearSlowTimer()
    slow.value = false
    if (isPending && typeof window !== 'undefined') {
      timer = setTimeout(() => { slow.value = true }, ms)
    }
  }, { immediate: true })

  onUnmounted(clearSlowTimer)

  return slow
}
