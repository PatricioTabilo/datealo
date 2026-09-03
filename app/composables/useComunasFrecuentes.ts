export function useComunasFrecuentes() {
  return useCatalogFetch('comunas-frecuentes', '/api/comunas/frecuentes', (data: { comunas: { codigo: string, nombre: string }[] }) =>
    data.comunas.map(c => ({ value: c.codigo, label: c.nombre })),
  )
}
