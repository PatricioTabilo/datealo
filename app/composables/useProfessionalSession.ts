import type { Professional } from '~/types/professional'

export async function useProfessionalSession() {
  const professional = useState<Professional | null>('professional-profile', () => null)
  const pending = useState('professional-profile-pending', () => true)
  const started = useState('professional-profile-started', () => false)

  if (!started.value) {
    started.value = true
    try {
      // useRequestFetch(), no $fetch a secas: durante SSR reenvía las cookies de la request original,
      // así la página ya llega al navegador con el estado de sesión correcto — sin esto, Nuxt no tiene
      // forma de saber quién pide la página hasta que el cliente hace su propio fetch.
      const { professional: data } = await useRequestFetch()<{ professional: Professional }>('/api/professionals/me')
      professional.value = data
    } catch {
      professional.value = null
    } finally {
      pending.value = false
    }
  }

  return {
    professional: computed(() => professional.value
      ? { displayName: professional.value.displayName, avatarUrl: professional.value.avatarUrl }
      : null),
    pending,
  }
}
