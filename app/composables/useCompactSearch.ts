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
  // lo revierta.
  function close() {
    isOpen.value = false
  }

  function selectCategoria(slug: string) {
    categoriaSlug.value = slug
    activeField.value = 'comuna'
  }

  // Elegir comuna busca directo, igual que elegir categoría ya avanza sola sin pedir confirmación — es
  // el mismo tipo de interacción (tocar una fila de una lista corta), así que exigir un tap extra acá
  // rompería esa misma consistencia. confirm() no navega si todavía falta la categoría (ej. en desktop,
  // si se abrió el panel de comuna primero), así que queda seguro incluso en ese orden.
  async function selectComuna(codigo: string) {
    comunaCodigo.value = codigo
    await confirm()
  }

  // "Buscar" queda además como respaldo manual: cambiar de categoría vuelve a mostrar la comuna ya
  // elegida sin resaltarla en la lista, así que tocarlo confirma esa misma comuna sin tener que
  // encontrarla de nuevo entre las opciones.
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
