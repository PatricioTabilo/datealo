const TEXT_FIELDS = ['displayName', 'categoriaSlug', 'contact'] as const

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody<Record<string, unknown>>(event)

  const fields = { displayName: '', categoriaSlug: '', contact: '' }
  for (const field of TEXT_FIELDS) {
    const value = body[field]
    if (typeof value !== 'string' || !value.trim()) {
      setResponseStatus(event, 400)
      return { error: 'missing_field', field }
    }
    fields[field] = value.trim()
  }
  fields.contact = normalizeContact(fields.contact)

  const comunaCodigosRaw = body.comunaCodigos
  if (
    !Array.isArray(comunaCodigosRaw)
    || comunaCodigosRaw.length === 0
    || !comunaCodigosRaw.every(codigo => typeof codigo === 'string' && codigo.trim())
  ) {
    setResponseStatus(event, 400)
    return { error: 'missing_field', field: 'comunaCodigos' }
  }
  // El servidor deduplica antes de validar e insertar — nunca confía en que el cliente ya lo hizo.
  const comunaCodigos = [...new Set(comunaCodigosRaw.map(codigo => codigo.trim()))]

  const fieldError = await validateProfessionalFields({ ...fields, comunaCodigos })
  if (fieldError) {
    setResponseStatus(event, 400)
    return fieldError
  }

  const { professional, created } = await createProfessional(user.id, { ...fields, comunaCodigos }, user.email ?? null)

  // El correo solo se dispara al crear de verdad — si el usuario ya tenía perfil, no se reenvía.
  if (created && user.email) {
    const categoriaNombre = await findCategoriaNombre(fields.categoriaSlug)
    const comunaNombre = new Intl.ListFormat('es-CL', { type: 'conjunction' }).format(professional.comunas.map(c => c.nombre))
    const { subject, html } = buildProfessionalWelcomeEmail({
      displayName: fields.displayName,
      categoriaNombre: categoriaNombre ?? fields.categoriaSlug,
      comunaNombre,
      profileUrl: `${getRequestURL(event).origin}/profesional/perfil`,
    })
    // waitUntil mantiene la función viva para el correo sin bloquear la respuesta al cliente; el
    // catch descarta el error a propósito — una falla de Resend nunca debe deshacer un perfil ya creado.
    event.waitUntil(sendEmail({ to: user.email, subject, html }).catch(() => {}))
  }

  setResponseStatus(event, created ? 201 : 200)
  return { professional }
})
