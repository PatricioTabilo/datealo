export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const categoriaSlug = typeof query.categoria === 'string' ? query.categoria : ''
  const comunaCodigo = typeof query.comuna === 'string' ? query.comuna : ''

  if (!categoriaSlug) {
    setResponseStatus(event, 400)
    return { error: 'categoria_required' }
  }
  if (!comunaCodigo) {
    setResponseStatus(event, 400)
    return { error: 'comuna_required' }
  }

  const [categoriaValid, comunaValid] = await Promise.all([
    existsActiveCategoria(categoriaSlug),
    existsActiveComuna(comunaCodigo),
  ])
  if (!categoriaValid) {
    setResponseStatus(event, 400)
    return { error: 'invalid_categoria' }
  }
  if (!comunaValid) {
    setResponseStatus(event, 400)
    return { error: 'invalid_comuna' }
  }

  return findSearchResults(categoriaSlug, comunaCodigo)
})
