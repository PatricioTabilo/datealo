import type { PublicProfessionalProfile } from '~/types/professional'

// Estado local, no useState: cada visita a /profesionales/[id] es un profesional distinto, no algo que
// deba compartirse entre páginas como useProfessionalProfile() (el propio perfil del dueño).
export function usePublicProfessionalProfile(id: string) {
  const validId = isUuid(id)

  const { data, pending, error, refresh } = useFetch<{ professional: PublicProfessionalProfile }>(
    `/api/professionals/${id}`,
    { key: `public-professional-${id}`, immediate: validId },
  )

  const professional = computed(() => data.value?.professional ?? null)
  const notFound = computed(() => !validId || Boolean(error.value))
  const slow = useSlowLoad(pending)

  return { professional, pending, notFound, slow, refresh }
}
