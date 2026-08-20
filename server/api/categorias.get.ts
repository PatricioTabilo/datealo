// El campo `activa` de cada categoría se cambia a mano en la base — no hay panel de administración
// todavía, así que no existe un evento de escritura desde el que invalidar un caché al instante. Por
// eso el control acá es un TTL de una hora en el CDN de Vercel (s-maxage), no una caché de aplicación:
// es el mecanismo que Vercel documenta para cachear respuestas de sus funciones.
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'cache-control', 'public, s-maxage=3600, stale-while-revalidate=86400')
  return { categorias: await findActiveCategorias() }
})
