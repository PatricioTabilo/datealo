export function useWaitlist(listKey: 'buscador' | 'profesional' = 'buscador') {
  const email = useState(`waitlist-email-${listKey}`, () => '')
  const loading = useState(`waitlist-loading-${listKey}`, () => false)
  const submitted = useState(`waitlist-submitted-${listKey}`, () => false)
  const error = useState<string | null>(`waitlist-error-${listKey}`, () => null)

  function isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  }

  async function submit() {
    error.value = null

    if (!email.value.trim()) {
      error.value = 'Ingresa tu email'
      return
    }

    if (!isValidEmail(email.value.trim())) {
      error.value = 'Ingresa un email válido'
      return
    }

    loading.value = true

    try {
      // Placeholder: store in localStorage until backend is ready
      const stored = JSON.parse(localStorage.getItem('datealo_waitlist') || '[]') as string[]
      const normalizedEmail = email.value.trim().toLowerCase()

      if (!stored.includes(normalizedEmail)) {
        stored.push(normalizedEmail)
        localStorage.setItem('datealo_waitlist', JSON.stringify(stored))
      }

      // Simulate network delay for realistic UX
      await new Promise(resolve => setTimeout(resolve, 600))

      submitted.value = true
    } catch {
      error.value = 'Ocurrió un error. Intenta de nuevo.'
    } finally {
      loading.value = false
    }
  }

  return { email, loading, submitted, error, submit }
}
