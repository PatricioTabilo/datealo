export function useComunasCatalog() {
  return useCatalogFetch('comunas', '/api/comunas', (data: { comunas: { codigo: string, nombre: string }[] }) =>
    data.comunas.map(c => ({ value: c.codigo, label: c.nombre })),
  )
}
