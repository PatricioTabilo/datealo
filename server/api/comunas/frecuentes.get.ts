export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'cache-control', 'public, s-maxage=3600, stale-while-revalidate=86400')
  return { comunas: await findComunasFrecuentes() }
})
