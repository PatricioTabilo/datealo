import { randomUUID } from 'node:crypto'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)

  const professional = await findProfessionalByUserId(user.id)
  if (!professional) {
    setResponseStatus(event, 404)
    return { error: 'not_found' }
  }

  const formData = await readMultipartFormData(event)
  const file = formData?.find(part => part.name === 'file')
  if (!file) {
    setResponseStatus(event, 400)
    return { error: 'invalid_file_type' }
  }
  const validated = validatePhotoUpload(file)
  if ('error' in validated) {
    setResponseStatus(event, 400)
    return validated
  }

  const path = `${user.id}/${randomUUID()}.${validated.extension}`
  const { error: uploadError } = await serverSupabase(event)
    .storage.from('professional-photos')
    .upload(path, file.data, { contentType: file.type })

  if (uploadError) {
    throw createError({ statusCode: 502, statusMessage: 'upload_failed' })
  }

  const previousPath = await findProfessionalAvatarPath(user.id)
  const updated = await setProfessionalAvatar(user.id, path)
  if (!updated) {
    setResponseStatus(event, 404)
    return { error: 'not_found' }
  }

  // El archivo nuevo ya quedó como el vigente en la columna — si el borrado del viejo falla acá, la
  // respuesta igual es éxito; el viejo queda huérfano en el bucket, un costo de storage, no de
  // correctitud.
  if (previousPath) {
    await serverSupabase(event).storage.from('professional-photos').remove([previousPath])
  }

  return { avatarUrl: updated.avatarUrl }
})
