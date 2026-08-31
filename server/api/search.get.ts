export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const categoriaSlug = typeof query.categoria === 'string' ? query.categoria : ''
  const comunaCodigo = typeof query.comuna === 'string' ? query.comuna : ''

  if (!categoriaSlug) return badRequest(event, 'categoria_required')
  if (!comunaCodigo) return badRequest(event, 'comuna_required')

  const [categoriaValid, comunaValid] = await Promise.all([
    existsActiveCategoria(categoriaSlug),
    existsActiveComuna(comunaCodigo),
  ])
  if (!categoriaValid) return badRequest(event, 'invalid_categoria')
  if (!comunaValid) return badRequest(event, 'invalid_comuna')

  return findSearchResults(categoriaSlug, comunaCodigo)
})
