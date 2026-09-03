export type LastSearchQuery = { categoria: string | null, comuna: string | null }

// El botón de volver del perfil necesita la categoría/comuna que trajo al usuario hasta ahí, pero esa
// ruta no lleva query propia — /buscar la escribe acá cada vez que cambia, para que el perfil la lea sin
// depender del historial del navegador, que no existe si se entró por un link externo.
export function useLastSearchQuery() {
  return useState<LastSearchQuery>('last-search-query', () => ({ categoria: null, comuna: null }))
}
