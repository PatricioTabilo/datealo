export function useProfessionalPhotos() {
  const { professional } = useProfessionalProfile()

  const uploading = useState('professional-photos-uploading', () => false)
  const uploadError = useState<string | null>('professional-photos-upload-error', () => null)
  const deletingPath = useState<string | null>('professional-photos-deleting', () => null)
  const deleteError = useState<string | null>('professional-photos-delete-error', () => null)

  async function upload(file: File) {
    uploadError.value = null
    uploading.value = true

    try {
      const compressed = await compressPhoto(file)
      const body = new FormData()
      body.append('file', compressed, 'photo.jpg')

      const { photoUrls } = await $fetch<{ path: string, photoUrls: string[] }>('/api/professionals/me/photos', {
        method: 'POST',
        body,
      })
      if (professional.value) professional.value = { ...professional.value, photoUrls }
    } catch {
      uploadError.value = 'No pudimos subir la foto. Intenta de nuevo.'
    } finally {
      uploading.value = false
    }
  }

  async function remove(path: string) {
    deleteError.value = null
    deletingPath.value = path

    try {
      const { photoUrls } = await $fetch<{ photoUrls: string[] }>('/api/professionals/me/photos', {
        method: 'DELETE',
        body: { path },
      })
      if (professional.value) professional.value = { ...professional.value, photoUrls }
    } catch {
      deleteError.value = 'No pudimos borrar la foto. Intenta de nuevo.'
    } finally {
      deletingPath.value = null
    }
  }

  return { uploading, uploadError, deletingPath, deleteError, upload, remove }
}
