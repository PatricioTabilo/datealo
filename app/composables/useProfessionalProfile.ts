import type { Professional, ProfessionalField } from '~/types/professional'

export function useProfessionalProfile() {
  const professional = useState<Professional | null>('professional-profile', () => null)
  const pending = useState('professional-profile-pending', () => true)
  const loadError = useState<string | null>('professional-profile-load-error', () => null)

  const editingField = useState<ProfessionalField | null>('professional-profile-editing', () => null)
  const savingField = useState<ProfessionalField | null>('professional-profile-saving', () => null)
  // fieldError es del valor mientras se escribe (contacto con formato inválido, no deja ni intentar
  // guardar); saveErrorField es de un guardado que sí se intentó y falló en el servidor — son casos
  // distintos con recuperación distinta (corregir el valor vs. reintentar el mismo valor).
  const fieldError = useState<string | null>('professional-profile-field-error', () => null)
  const saveErrorField = useState<ProfessionalField | null>('professional-profile-save-error', () => null)

  // Aparte de savingField/saveErrorField: comunas no es un ProfessionalField (no tiene draft de texto
  // ni edición en línea, se confirma entera desde el sheet), así que necesita su propio estado de
  // guardado en vez de compartir el de displayName/contact.
  const savingComunas = useState('professional-profile-saving-comunas', () => false)
  const comunasSaveError = useState('professional-profile-comunas-save-error', () => false)

  async function load() {
    await fetchProfessionalOnce(professional, pending, loadError)
  }

  function startEdit(field: ProfessionalField) {
    saveErrorField.value = null
    fieldError.value = null
    editingField.value = field
  }

  function cancelEdit() {
    editingField.value = null
    fieldError.value = null
  }

  async function save(field: ProfessionalField, value: string | number | null) {
    if (!professional.value) return

    if (field === 'contact' && typeof value === 'string') {
      if (!isValidChileanContact(value)) {
        fieldError.value = 'Ese número no parece válido. Debe ser un WhatsApp o teléfono chileno, ej: +56 9 1234 5678.'
        return
      }
      value = normalizeChileanContact(value)
    }

    fieldError.value = null
    editingField.value = null
    savingField.value = field
    saveErrorField.value = null

    try {
      const { professional: updated } = await $fetch<{ professional: Professional }>('/api/professionals/me', {
        method: 'PATCH',
        body: { [field]: value },
      })
      professional.value = updated
    } catch {
      saveErrorField.value = field
    } finally {
      savingField.value = null
    }
  }

  async function saveComunas(comunaCodigos: string[]) {
    if (!professional.value) return

    savingComunas.value = true
    comunasSaveError.value = false

    try {
      const { professional: updated } = await $fetch<{ professional: Professional }>('/api/professionals/me', {
        method: 'PATCH',
        body: { comunaCodigos },
      })
      professional.value = updated
    } catch {
      comunasSaveError.value = true
    } finally {
      savingComunas.value = false
    }
  }

  return {
    professional,
    pending,
    loadError,
    editingField,
    savingField,
    fieldError,
    saveErrorField,
    savingComunas,
    comunasSaveError,
    load,
    startEdit,
    cancelEdit,
    save,
    saveComunas,
  }
}
