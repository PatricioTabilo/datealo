export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody<{ path?: unknown }>(event)

  const path = body.path
  if (typeof path !== 'string' || !path) {
    setResponseStatus(event, 400)
    return { error: 'missing_field', field: 'path' }
  }

  if (!path.startsWith(`${user.id}/`)) {
    setResponseStatus(event, 403)
    return { error: 'forbidden' }
  }

  const owns = await professionalHasPhotoPath(user.id, path)
  if (!owns) {
    setResponseStatus(event, 404)
    return { error: 'not_found' }
  }

  const { error: removeError } = await serverSupabase(event).storage.from('professional-photos').remove([path])
  if (removeError) {
    throw createError({ statusCode: 502, statusMessage: 'remove_failed' })
  }

  const updated = await removeProfessionalPhoto(user.id, path)
  if (!updated) {
    setResponseStatus(event, 404)
    return { error: 'not_found' }
  }

  return { photoUrls: updated.photoUrls }
})
