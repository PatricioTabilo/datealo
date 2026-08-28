// Único lugar que decide a dónde manda una página de este dominio según la sesión — así las tres
// páginas comparten la misma regla en vez de repetir la llamada a /api/auth/me cada una por su lado.
export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === '/profesional/ingresar') return

  try {
    await $fetch('/api/auth/me')
  } catch {
    return navigateTo('/profesional/ingresar')
  }
})
