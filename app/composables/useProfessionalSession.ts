import type { Professional } from '~/types/professional'

export function useProfessionalSession() {
  const professional = useState<Professional | null>('professional-profile', () => null)
  const pending = useState('professional-profile-pending', () => true)
  const started = useState('professional-profile-started', () => false)

  onMounted(() => {
    if (started.value) return
    started.value = true

    $fetch<{ professional: Professional }>('/api/professionals/me')
      .then((response) => { professional.value = response.professional })
      .catch(() => { professional.value = null })
      .finally(() => { pending.value = false })
  })

  return {
    professional: computed(() => professional.value
      ? { displayName: professional.value.displayName, avatarUrl: professional.value.avatarUrl }
      : null),
    pending,
  }
}
