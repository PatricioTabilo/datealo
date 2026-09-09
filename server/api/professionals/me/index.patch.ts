const TEXT_FIELDS = ['displayName', 'comunaCodigo', 'contact'] as const

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody<Record<string, unknown>>(event)

  const patch: ProfessionalPatch = {}

  for (const field of TEXT_FIELDS) {
    if (!(field in body)) continue
    const value = body[field]
    if (typeof value !== 'string' || !value.trim()) {
      setResponseStatus(event, 400)
      return { error: 'missing_field', field }
    }
    patch[field] = field === 'contact' ? normalizeContact(value.trim()) : value.trim()
  }

  if ('comunaCodigos' in body) {
    const value = body.comunaCodigos
    if (
      !Array.isArray(value)
      || value.length === 0
      || !value.every(codigo => typeof codigo === 'string' && codigo.trim())
    ) {
      setResponseStatus(event, 400)
      return { error: 'missing_field', field: 'comunaCodigos' }
    }
    // El servidor deduplica antes de validar e insertar — nunca confía en que el cliente ya lo hizo.
    patch.comunaCodigos = [...new Set(value.map(codigo => codigo.trim()))]
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
