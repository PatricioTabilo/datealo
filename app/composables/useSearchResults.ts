import type { Ref } from 'vue'
import type { SearchApiResponse, SearchMatchType, SearchResultProfessional } from '~/types/search'

// watch: false en useFetch — no dispara ninguna request hasta que categoría y comuna tengan valor;
// dejarlo reactivo a la query dispararía apenas cambia una de las dos, aunque la otra siga vacía, y
// mezclaría "todavía no se buscó" con "se buscó y no hay nada".
//
// immediate se evalúa una sola vez, con el valor de `ready` en ese instante — no `false` fijo. Server
// y cliente arrancan del mismo route.query, así que si la búsqueda ya viene lista en la URL (el caso
// que le importa a un crawler o a un link compartido), los dos coinciden en pedir el fetch de entrada,
// y el SSR lo espera antes de mandar el HTML. Con `immediate: false` a secas y el refresh() disparado
// a mano más abajo, el servidor mandaba el esqueleto de "cargando" sin esperar nada (Nuxt solo trackea
// para el SSR los fetches que useFetch dispara por su cuenta, no un refresh() llamado aparte) mientras
// el cliente hidrataba ya con los datos resueltos — el choque rompía el grid de resultados en pantalla.
export function useSearchResults(categoriaSlug: Ref<string | null>, comunaCodigo: Ref<string | null>) {
  const ready = computed(() => Boolean(categoriaSlug.value) && Boolean(comunaCodigo.value))

  const { data, pending, error, refresh } = useFetch<SearchApiResponse>('/api/search', {
    key: 'search-results',
    query: computed(() => ({ categoria: categoriaSlug.value, comuna: comunaCodigo.value })),
    immediate: ready.value,
    watch: false,
  })

  // Sin immediate acá: el fetch de entrada, cuando ya estaba listo al montar, ya lo cubrió el
  // `immediate` de arriba. Este watch solo cubre lo que pasa después del montaje — cambiar de
  // categoría o comuna, o quedar "listo" recién en ese momento.
  watch([categoriaSlug, comunaCodigo], () => {
    if (ready.value) refresh()
  })

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
