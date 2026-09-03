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

  // Snapshot al abrir, restaurado si se cierra sin confirmar — una selección que ya existía antes de
  // abrir el panel nunca se pierde, solo se descarta lo tocado en esta apertura.
  let snapshot: { categoriaSlug: string | null, comunaCodigo: string | null } | null = null

  function open(field?: CompactSearchField) {
    snapshot = { categoriaSlug: categoriaSlug.value, comunaCodigo: comunaCodigo.value }
    activeField.value = field ?? (categoriaSlug.value ? 'comuna' : 'categoria')
    isOpen.value = true
  }

  function close() {
    if (snapshot) {
      categoriaSlug.value = snapshot.categoriaSlug
      comunaCodigo.value = snapshot.comunaCodigo
    }
    isOpen.value = false
  }

  function selectCategoria(slug: string) {
    categoriaSlug.value = slug
    activeField.value = 'comuna'
  }

  function selectComuna(codigo: string) {
    comunaCodigo.value = codigo
  }

  async function confirm() {
    if (!ready.value) return
    snapshot = null
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
