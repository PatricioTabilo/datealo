import type { Professional } from '~/types/professional'

const inflight = new WeakMap<object, Promise<void>>()

// AppHeader y AppFooter llaman a useProfessionalSession() en paralelo durante SSR (Vue arranca el setup
// de ambos componentes antes de esperar a que el primero termine), así que sin deduplicar el segundo
// dispararía su propio fetch a /api/professionals/me. Un watch() sobre un flag "pending" no sirve para
// avisarle al segundo cuándo terminó el primero: Vue no corre el scheduler de reactividad durante
// renderToString, así que el watcher nunca dispara y el segundo queda esperando para siempre. La promesa
// compartida evita depender de reactividad — el segundo simplemente espera la misma promesa que ya está en
// curso. Se cachea por instancia de NuxtApp para no filtrar entre requests concurrentes, y el `finally`
// saca la entrada de `inflight` al terminar: en el cliente esa instancia vive toda la sesión, y una
// promesa ya resuelta quedaría para siempre — tras registrarse, /profesional/perfil reusaría el 404 de
// antes del registro en vez de pedir el perfil recién creado.
export function fetchProfessionalOnce(
  professional: Ref<Professional | null>,
  pending: Ref<boolean>,
  loadError: Ref<string | null>,
) {
  const nuxtApp = useNuxtApp()
  const cached = inflight.get(nuxtApp)
  if (cached) return cached

  pending.value = true
  loadError.value = null
  // useRequestFetch(), no $fetch a secas: durante SSR reenvía las cookies de la request original (mismo
  // motivo que app/middleware/profesional.ts), y en el cliente se comporta igual que $fetch.
  const promise = useRequestFetch()<{ professional: Professional }>('/api/professionals/me')
    .then(({ professional: data }) => {
      professional.value = data
    })
    .catch(() => {
      professional.value = null
      loadError.value = 'No pudimos cargar tu perfil.'
    })
    .finally(() => {
      pending.value = false
      inflight.delete(nuxtApp)
    })

  inflight.set(nuxtApp, promise)
  return promise
}
