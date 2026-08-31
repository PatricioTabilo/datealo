import type { Ref } from 'vue'
import type { SearchApiResponse, SearchMatchType, SearchResultProfessional } from '~/types/search'

// immediate/watch en false: no dispara ninguna request hasta que categoría y comuna tengan valor —
// "todavía no se buscó" y "se buscó y no hay nada" tienen que quedar como dos estados distintos, y
// dejar que useFetch dispare solo con la query vacía los mezclaría en uno.
export function useSearchResults(categoriaSlug: Ref<string | null>, comunaCodigo: Ref<string | null>) {
  const ready = computed(() => Boolean(categoriaSlug.value) && Boolean(comunaCodigo.value))

  const { data, pending, error, refresh } = useFetch<SearchApiResponse>('/api/search', {
    key: 'search-results',
    query: computed(() => ({ categoria: categoriaSlug.value, comuna: comunaCodigo.value })),
    immediate: false,
    watch: false,
  })

  watch([categoriaSlug, comunaCodigo], () => {
    if (ready.value) refresh()
  }, { immediate: true })

  const results = computed<SearchResultProfessional[]>(() => data.value?.results ?? [])
  const matchType = computed<SearchMatchType | null>(() => data.value?.matchType ?? null)
  const categoryHasResultsInChile = computed(() => data.value?.categoryHasResultsInChile ?? true)
  const slow = useSlowLoad(pending)

  return {
    ready,
    pending,
    error: computed(() => Boolean(error.value)),
    results,
    matchType,
    categoryHasResultsInChile,
    slow,
    refresh,
  }
}
