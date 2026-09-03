export type CompactSearchField = 'categoria' | 'comuna'

export function useCompactSearch() {
  const route = useRoute()
  const startsOnBuscar = route.path === '/buscar'

  const categoriaSlug = ref<string | null>(
    startsOnBuscar && typeof route.query.categoria === 'string' ? route.query.categoria : null,
  )
  const comunaCodigo = ref<string | null>(
    startsOnBuscar && typeof route.query.comuna === 'string' ? route.query.comuna : null,
  )
  const isOpen = ref(false)
  const activeField = ref<CompactSearchField>('categoria')

  const ready = computed(() => Boolean(categoriaSlug.value) && Boolean(comunaCodigo.value))

  // El botón compacto de mobile llama open() sin argumento — siempre parte en categoría, incluso si ya
  // hay una elegida (ej. en /buscar): es el único campo con lista corta y sin buscador de texto, así que
  // reelegirla de paso no cuesta un tap extra. Desktop siempre pasa el field explícito y nunca pasa por
  // este default.
  function open(field: CompactSearchField = 'categoria') {
    activeField.value = field
    isOpen.value = true
  }

  // Cerrar (click afuera, la X) solo cierra — lo que ya se eligió, elegido queda; no hay "cancelar" que
  // lo revierta. Confirmar con "Buscar" es la única acción que navega.
  function close() {
    isOpen.value = false
  }

  function selectCategoria(slug: string) {
    categoriaSlug.value = slug
    activeField.value = 'comuna'
  }

  // A diferencia de la categoría (que sigue directo al siguiente campo), la comuna es el último paso —
  // elegirla cierra el panel: no queda nada más por completar antes de poder tocar "Buscar".
  function selectComuna(codigo: string) {
    comunaCodigo.value = codigo
    isOpen.value = false
  }

  async function confirm() {
    if (!ready.value) return
    isOpen.value = false
    await navigateTo({ path: '/buscar', query: { categoria: categoriaSlug.value, comuna: comunaCodigo.value } })
  }

  return {
    categoriaSlug,
    comunaCodigo,
    isOpen,
    activeField,
    ready,
    open,
    close,
    selectCategoria,
    selectComuna,
    confirm,
  }
}
