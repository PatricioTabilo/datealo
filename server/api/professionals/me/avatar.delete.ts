export default defineEventHandler(async (event) => {
  const user = await requireUser(event)

  const professional = await findProfessionalByUserId(user.id)
  if (!professional) {
    setResponseStatus(event, 404)
    return { error: 'not_found' }
  }

  // "Sin avatar" es un dato válido del perfil, no un error — un doble clic en "Quitar foto" vuelve a
  // pasar por acá y debe responder éxito otra vez, no fallar la segunda vez.
  if (!professional.avatarUrl) {
    return { avatarUrl: null }
  }

  const path = await findProfessionalAvatarPath(user.id)
  if (path) {
    const { error: removeError } = await serverSupabase(event).storage.from('professional-photos').remove([path])
    if (removeError) {
      throw createError({ statusCode: 502, statusMessage: 'remove_failed' })
    }
  }

  const updated = await clearProfessionalAvatar(user.id)
  if (!updated) {
    setResponseStatus(event, 404)
    return { error: 'not_found' }
  }

  return { avatarUrl: null }
})
