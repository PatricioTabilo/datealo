// Catálogo de referencia, cambia solo a mano (D-002) — sin panel de admin no hay evento de escritura
// desde el que invalidar un caché al instante, así que el control real es un TTL en el CDN de Vercel
// (s-maxage), no una caché de aplicación opaca sobre serverless (T-004).
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'cache-control', 'public, s-maxage=3600, stale-while-revalidate=86400')
  return { comunas: await findActiveComunas() }
})
