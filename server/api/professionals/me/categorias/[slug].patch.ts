export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const categoriaSlug = getRouterParam(event, 'slug') ?? ''
  const body = await readBody<Record<string, unknown>>(event)

  const patch: { priceFrom?: number | null, description?: string | null } = {}

  if ('priceFrom' in body) {
    const value = body.priceFrom
    if (value !== null && typeof value !== 'number') {
      setResponseStatus(event, 400)
      return { error: 'invalid_price' }
    }
    patch.priceFrom = value
  }

  if ('description' in body) {
    const value = body.description
    if (value !== null && typeof value !== 'string') {
      setResponseStatus(event, 400)
      return { error: 'invalid_description' }
    }
    patch.description = typeof value === 'string' ? value.trim() || null : null
  }

  const fieldError = await validateProfessionalFields(patch)
  if (fieldError) {
    setResponseStatus(event, 400)
    return fieldError
  }

  const professional = await findProfessionalByUserId(user.id)
  if (!professional) {
    setResponseStatus(event, 404)
    return { error: 'not_found' }
  }

  const categorias = await updateProfessionalCategoria(professional.id, categoriaSlug, patch)
  if (!categorias) {
    setResponseStatus(event, 404)
    return { error: 'not_found' }
  }

  return { categorias }
})
