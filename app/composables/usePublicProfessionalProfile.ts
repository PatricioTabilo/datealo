import type { PublicProfessionalProfile } from '~/types/professional'

const SLOW_LOAD_MS = 10_000

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

  // "Tardando": sigue pending pasados los 10s, sin haber resuelto ni a encontrado ni a 404.
  const slow = ref(false)
  let slowTimer: ReturnType<typeof setTimeout> | undefined

  function clearSlowTimer() {
    if (slowTimer) clearTimeout(slowTimer)
    slowTimer = undefined
  }

  watch(pending, (isPending) => {
    clearSlowTimer()
    slow.value = false
    if (isPending && import.meta.client) {
      slowTimer = setTimeout(() => { slow.value = true }, SLOW_LOAD_MS)
    }
  }, { immediate: true })

  onUnmounted(clearSlowTimer)

  return { professional, pending, notFound, slow, refresh }
}
