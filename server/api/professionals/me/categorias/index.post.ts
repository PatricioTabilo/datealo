export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody<Record<string, unknown>>(event)

  const categoriaSlug = body.categoriaSlug
  if (typeof categoriaSlug !== 'string' || !categoriaSlug.trim()) {
    setResponseStatus(event, 400)
    return { error: 'missing_field', field: 'categoriaSlug' }
  }

  let priceFrom: number | null = null
  if ('priceFrom' in body) {
    const value = body.priceFrom
    if (value !== null && typeof value !== 'number') {
      setResponseStatus(event, 400)
      return { error: 'invalid_price' }
    }
    priceFrom = value
  }

  let description: string | null = null
  if ('description' in body) {
    const value = body.description
    if (value !== null && typeof value !== 'string') {
      setResponseStatus(event, 400)
      return { error: 'invalid_description' }
    }
    description = typeof value === 'string' ? value.trim() || null : null
  }

  const fieldError = await validateProfessionalFields({ categoriaSlug, priceFrom })
  if (fieldError) {
    setResponseStatus(event, 400)
    return fieldError
  }

  const professional = await findProfessionalByUserId(user.id)
  if (!professional) {
    setResponseStatus(event, 404)
    return { error: 'not_found' }
  }

  const categorias = await addProfessionalCategoria(professional.id, categoriaSlug, priceFrom, description)
  if (!categorias) {
    setResponseStatus(event, 400)
    return { error: 'already_declared' }
  }

  setResponseStatus(event, 201)
  return { categorias }
})
