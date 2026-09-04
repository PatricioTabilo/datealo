import type { Professional } from '~/types/professional'

export async function useProfessionalSession() {
  const professional = useState<Professional | null>('professional-profile', () => null)
  const pending = useState('professional-profile-pending', () => true)
  const loadError = useState<string | null>('professional-profile-load-error', () => null)

  await fetchProfessionalOnce(professional, pending, loadError)

  return {
    professional: computed(() => professional.value
      ? { displayName: professional.value.displayName, avatarUrl: professional.value.avatarUrl }
      : null),
    pending,
  }
}
