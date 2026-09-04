import { onMounted, onUnmounted, watch } from 'vue'
import type { Ref } from 'vue'

// Publica el alto real de la barra en --contact-bar-h (:root) en vez de asumir un número fijo — así el
// espacio que reserva quien la usa (AppFooter) se ajusta solo si la barra cambia de alto, en vez de
// quedar bien calibrado solo para el contenido de hoy. Import explícito de Vue (no auto-import de Nuxt),
// mismo criterio que useSlowLoad: se puede testear con Vitest sin levantar un contexto de Nuxt completo.
export function useContactBarHeight(barRef: Ref<HTMLElement | null>) {
  let observer: ResizeObserver | null = null

  onMounted(() => {
    observer = new ResizeObserver((entries) => {
      const height = entries[0]?.contentRect.height
      if (height !== undefined) {
        document.documentElement.style.setProperty('--contact-bar-h', `${height}px`)
      }
    })

    watch(barRef, (el, _previous, onCleanup) => {
      if (!el) return
      observer?.observe(el)
      onCleanup(() => observer?.unobserve(el))
    }, { immediate: true })
  })

  onUnmounted(() => {
    observer?.disconnect()
    document.documentElement.style.removeProperty('--contact-bar-h')
  })
}
