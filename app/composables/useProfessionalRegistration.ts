export function useProfessionalRegistration() {
  const displayName = useState('professional-registration-display-name', () => '')
  const categoriaSlug = useState<string | null>('professional-registration-categoria', () => null)
  const comunaCodigo = useState<string | null>('professional-registration-comuna', () => null)
  const contact = useState('professional-registration-contact', () => '')
  const contactError = useState<string | null>('professional-registration-contact-error', () => null)
  const loading = useState('professional-registration-loading', () => false)
  const submitError = useState<string | null>('professional-registration-submit-error', () => null)

  const isComplete = computed(() =>
    Boolean(
      displayName.value.trim()
      && categoriaSlug.value
      && comunaCodigo.value
      && contact.value.trim()
      && !contactError.value,
    ),
  )

  function validateContact() {
    contactError.value = !contact.value.trim() || isValidChileanContact(contact.value)
      ? null
      : 'Ese número no parece válido. Debe ser un WhatsApp o teléfono chileno, ej: +56 9 1234 5678.'
  }

  async function submit() {
    if (!isComplete.value || loading.value) return

    submitError.value = null
    loading.value = true

    try {
      await $fetch('/api/professionals', {
        method: 'POST',
        body: {
          displayName: displayName.value.trim(),
          categoriaSlug: categoriaSlug.value,
          comunaCodigo: comunaCodigo.value,
          contact: normalizeChileanContact(contact.value),
        },
      })
      await navigateTo('/profesional/perfil')
    } catch {
      submitError.value = 'No pudimos publicar tu perfil, pero tus datos siguen acá.'
    } finally {
      loading.value = false
    }
  }

  return {
    displayName,
    categoriaSlug,
    comunaCodigo,
    contact,
    contactError,
    loading,
    submitError,
    isComplete,
    validateContact,
    submit,
  }
}
