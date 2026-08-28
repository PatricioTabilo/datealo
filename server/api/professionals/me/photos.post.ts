import { randomUUID } from 'node:crypto'

const MAX_FILE_SIZE = 4 * 1024 * 1024
const MAX_PHOTOS = 12
const EXTENSION_BY_MIME_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)

  const professional = await findProfessionalByUserId(user.id)
  if (!professional) {
    setResponseStatus(event, 404)
    return { error: 'not_found' }
  }
  if (professional.photoUrls.length >= MAX_PHOTOS) {
    setResponseStatus(event, 400)
    return { error: 'too_many_photos' }
  }

  const formData = await readMultipartFormData(event)
  const file = formData?.find(part => part.name === 'file')
  const extension = file?.type ? EXTENSION_BY_MIME_TYPE[file.type] : undefined
  if (!file || !extension) {
    setResponseStatus(event, 400)
    return { error: 'invalid_file_type' }
  }
  if (file.data.length > MAX_FILE_SIZE) {
    setResponseStatus(event, 400)
    return { error: 'file_too_large' }
  }

  const path = `${user.id}/${randomUUID()}.${extension}`
  const { error: uploadError } = await serverSupabase(event)
    .storage.from('professional-photos')
    .upload(path, file.data, { contentType: file.type })

  if (uploadError) {
    throw createError({ statusCode: 502, statusMessage: 'upload_failed' })
  }

  const updated = await addProfessionalPhoto(user.id, path)
  if (!updated) {
    setResponseStatus(event, 404)
    return { error: 'not_found' }
  }

  setResponseStatus(event, 201)
  return { path, photoUrls: updated.photoUrls }
})
