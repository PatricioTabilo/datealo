const REQUIRED_FIELDS = ['displayName', 'categoriaSlug', 'comunaCodigo', 'contact'] as const

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody<Record<string, unknown>>(event)

  const fields = { displayName: '', categoriaSlug: '', comunaCodigo: '', contact: '' }
  for (const field of REQUIRED_FIELDS) {
    const value = body[field]
    if (typeof value !== 'string' || !value.trim()) {
      setResponseStatus(event, 400)
      return { error: 'missing_field', field }
    }
    fields[field] = value.trim()
  }
  fields.contact = normalizeContact(fields.contact)

  const fieldError = await validateProfessionalFields(fields)
  if (fieldError) {
    setResponseStatus(event, 400)
    return fieldError
  }

  const { professional, created } = await createProfessional(user.id, fields)

  // El correo solo se dispara al crear de verdad — si el usuario ya tenía perfil, no se reenvía.
  if (created && user.email) {
    const [categoriaNombre, comunaNombre] = await Promise.all([
      findCategoriaNombre(fields.categoriaSlug),
      findComunaNombre(fields.comunaCodigo),
    ])
    const { subject, html } = buildProfessionalWelcomeEmail({
      displayName: fields.displayName,
      categoriaNombre: categoriaNombre ?? fields.categoriaSlug,
      comunaNombre: comunaNombre ?? fields.comunaCodigo,
      profileUrl: `${getRequestURL(event).origin}/profesional/perfil`,
    })
    // waitUntil mantiene la función viva para el correo sin bloquear la respuesta al cliente; el
    // catch descarta el error a propósito — una falla de Resend nunca debe deshacer un perfil ya creado.
    event.waitUntil(sendEmail({ to: user.email, subject, html }).catch(() => {}))
  }

  setResponseStatus(event, created ? 201 : 200)
  return { professional }
})
