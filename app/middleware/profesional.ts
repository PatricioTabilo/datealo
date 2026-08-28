// Único lugar que decide a dónde manda una página de este dominio según sesión + existencia de perfil
// — así las tres páginas comparten la misma regla en vez de repetir la lógica cada una por su lado.
export default defineNuxtRouteMiddleware(async (to) => {
  // useRequestFetch(), no $fetch a secas: durante SSR reenvía las cookies de la request original — sin
  // esto, seguir el enlace del correo (una navegación completa) siempre ve "sin sesión".
  const fetcher = useRequestFetch()

  try {
    await fetcher('/api/auth/me')
  } catch {
    if (to.path === '/profesional/ingresar') return
    return navigateTo('/profesional/ingresar')
  }

  // Con sesión, dónde corresponde pararse depende de si ya existe un perfil — la misma pregunta que
  // GET /auth/confirm ya resuelve al terminar el enlace mágico. Se repite acá porque también se puede
  // llegar a estas páginas con sesión ya armada sin pasar por ese endpoint (un bookmark, la URL escrita
  // a mano).
  let hasProfile = true
  try {
    await fetcher('/api/professionals/me')
  } catch {
    hasProfile = false
  }

  const destination = hasProfile ? '/profesional/perfil' : '/profesional/registro'
  if (to.path !== destination) {
    return navigateTo(destination)
  }
})
