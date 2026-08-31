// El body es opcional y lleva como máximo un token opaco, sin ningún dato que identifique a la persona —
// nunca bloquea el registro del contacto si falta o llega roto.
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') ?? ''
  const registered = await registerProfessionalContact(id)

  if (!registered) {
    setResponseStatus(event, 404)
    return { error: 'not_found' }
  }

  const body = await readBody(event).catch(() => null)
  const token = typeof body?.token === 'string' ? body.token : undefined
  await registerContactToken(id, token).catch(() => {})

  setResponseStatus(event, 204)
  return null
})
