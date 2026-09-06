import { onMounted, onUnmounted, watch } from 'vue'
import type { Ref } from 'vue'

// Publica el alto real del header en --header-h (:root) en vez de asumir un número fijo — mismo criterio
// que useContactBarHeight. Lo consume cualquier elemento sticky que deba despegarse por debajo del header
// (z-20, opaco) en vez de bajo su fondo.
export function useHeaderHeight(headerRef: Ref<HTMLElement | null>) {
  let observer: ResizeObserver | null = null

  onMounted(() => {
    observer = new ResizeObserver((entries) => {
      const height = entries[0]?.contentRect.height
      if (height !== undefined) {
        document.documentElement.style.setProperty('--header-h', `${height}px`)
      }
    })

    watch(headerRef, (el, _previous, onCleanup) => {
      if (!el) return
      observer?.observe(el)
      onCleanup(() => observer?.unobserve(el))
    }, { immediate: true })
  })

  onUnmounted(() => {
    observer?.disconnect()
    document.documentElement.style.removeProperty('--header-h')
  })
}
