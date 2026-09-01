export function useProfessionalAvatar() {
  const { professional } = useProfessionalProfile()

  const uploading = useState('professional-avatar-uploading', () => false)
  const uploadError = useState<string | null>('professional-avatar-upload-error', () => null)
  const removing = useState('professional-avatar-removing', () => false)
  const removeError = useState<string | null>('professional-avatar-remove-error', () => null)

  async function upload(file: File) {
    uploadError.value = null
    uploading.value = true

    try {
      const compressed = await compressPhoto(file)
      const body = new FormData()
      body.append('file', compressed, 'avatar.jpg')

      const { avatarUrl } = await $fetch<{ avatarUrl: string }>('/api/professionals/me/avatar', {
        method: 'POST',
        body,
      })
      if (professional.value) professional.value = { ...professional.value, avatarUrl }
    } catch {
      uploadError.value = 'No pudimos subir la foto. Intenta de nuevo.'
    } finally {
      uploading.value = false
    }
  }

  async function remove() {
    removeError.value = null
    removing.value = true

    try {
      await $fetch('/api/professionals/me/avatar', { method: 'DELETE' })
      if (professional.value) professional.value = { ...professional.value, avatarUrl: null }
    } catch {
      removeError.value = 'No pudimos quitar la foto. Intenta de nuevo.'
    } finally {
      removing.value = false
    }
  }

  return { uploading, uploadError, removing, removeError, upload, remove }
}
