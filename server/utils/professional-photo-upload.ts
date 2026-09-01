import type { MultiPartData } from 'h3'

export const MAX_PHOTO_FILE_SIZE = 4 * 1024 * 1024

const EXTENSION_BY_MIME_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

export type PhotoUploadError = { error: 'invalid_file_type' | 'file_too_large' }

// Compartida entre las fotos de trabajo (photos.post.ts) y la foto de perfil (avatar.post.ts): ambas
// suben al mismo bucket, con el mismo límite de tamaño y los mismos tipos MIME.
export function validatePhotoUpload(file: MultiPartData): { extension: string } | PhotoUploadError {
  const extension = file.type ? EXTENSION_BY_MIME_TYPE[file.type] : undefined
  if (!extension) {
    return { error: 'invalid_file_type' }
  }
  if (file.data.length > MAX_PHOTO_FILE_SIZE) {
    return { error: 'file_too_large' }
  }
  return { extension }
}
