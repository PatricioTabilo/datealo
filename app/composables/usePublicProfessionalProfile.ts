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

  // useFetch guarda `data` en un shallowRef — mutar una propiedad anidada (professional.value.reviews =
  // ...) no dispara ningún re-render, solo reasignar data.value entero lo hace. Esto es lo que permite
  // que una reseña recién publicada aparezca sin recargar la página, sin pagar un segundo round-trip.
  function updateProfessional(patch: Partial<PublicProfessionalProfile>) {
    if (!data.value?.professional) return
    data.value = { professional: { ...data.value.professional, ...patch } }
  }

  return { professional, pending, notFound, slow, refresh, updateProfessional }
}
