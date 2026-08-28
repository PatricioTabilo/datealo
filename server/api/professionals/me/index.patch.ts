const TEXT_FIELDS = ['displayName', 'categoriaSlug', 'comunaCodigo', 'contact'] as const

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody<Record<string, unknown>>(event)

  const patch: ProfessionalFieldsInput = {}

  for (const field of TEXT_FIELDS) {
    if (!(field in body)) continue
    const value = body[field]
    if (typeof value !== 'string' || !value.trim()) {
      setResponseStatus(event, 400)
      return { error: 'missing_field', field }
    }
    patch[field] = field === 'contact' ? normalizeContact(value.trim()) : value.trim()
  }

  if ('description' in body) {
    const value = body.description
    if (value !== null && typeof value !== 'string') {
      setResponseStatus(event, 400)
      return { error: 'invalid_description' }
    }
    patch.description = typeof value === 'string' ? value.trim() || null : null
  }

  if ('priceFrom' in body) {
    const value = body.priceFrom
    if (value !== null && typeof value !== 'number') {
      setResponseStatus(event, 400)
      return { error: 'invalid_price' }
    }
    patch.priceFrom = value
  }

  const fieldError = await validateProfessionalFields(patch)
  if (fieldError) {
    setResponseStatus(event, 400)
    return fieldError
  }

  const professional = await updateProfessional(user.id, patch)
  if (!professional) {
    setResponseStatus(event, 404)
    return { error: 'not_found' }
  }

  return { professional }
})
