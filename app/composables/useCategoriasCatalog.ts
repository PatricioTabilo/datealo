export function useCategoriasCatalog() {
  return useCatalogFetch('categorias', '/api/categorias', (data: { categorias: { slug: string, nombre: string }[] }) =>
    data.categorias.map(c => ({ value: c.slug, label: c.nombre })),
  )
}
