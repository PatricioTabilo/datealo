export type CatalogOption = { value: string, label: string }

// Fetch con cache y manejo de error para un catálogo de referencia (categorías, comunas). No sabe qué
// entidad trae — normalize() traduce la respuesta cruda del endpoint a la forma genérica que espera
// CatalogSelect. useCategoriasCatalog()/useComunasCatalog() son los únicos que conocen slug vs codigo.
export function useCatalogFetch<T>(key: string, endpoint: string, normalize: (data: T) => CatalogOption[]) {
  // dedupe: 'defer' es necesario para que dos llamadas concurrentes con la misma key compartan el
  // fetch en vez de que la segunda cancele la primera y dispare su propia request (default de Nuxt).
  // getCachedData cubre el caso de navegar de vuelta a una key ya resuelta, sin volver a pedir la red.
  const { data, pending, error, refresh } = useAsyncData<T>(key, () => $fetch(endpoint), {
    dedupe: 'defer',
    getCachedData: (dataKey, nuxtApp) => nuxtApp.payload.data[dataKey] ?? nuxtApp.static.data[dataKey],
  })

  const items = computed(() => (data.value ? normalize(data.value as T) : []))

  return {
    items,
    pending,
    error: computed(() => Boolean(error.value)),
    refresh,
  }
}
