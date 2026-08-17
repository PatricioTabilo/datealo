import { createServerClient } from '@supabase/ssr'
import { parseCookies, setCookie } from 'h3'
import type { H3Event } from 'h3'

// Contrato de requireUser() de cara al resto del código: provider-agnostic a propósito, para que
// cambiar el proveedor de auth solo implique reescribir este archivo.
export type AuthUser = {
  id: string
  email: string | null
}

function serverSupabase(event: H3Event) {
  const { public: pub } = useRuntimeConfig()
  // La publishable key, no la secret key: este cliente representa al usuario de la sesión, no un
  // acceso admin. Con la secret key cualquier query por este cliente saltaría RLS por completo.
  return createServerClient(pub.supabaseUrl, pub.supabaseKey, {
    cookies: {
      getAll: () => Object.entries(parseCookies(event)).map(([name, value]) => ({ name, value })),
      setAll: (cookies) =>
        cookies.forEach(({ name, value, options }) => setCookie(event, name, value, options)),
    },
  })
}

export async function requireUser(event: H3Event): Promise<AuthUser> {
  const supabase = serverSupabase(event)
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) {
    throw createError({ statusCode: 401, statusMessage: 'unauthorized' })
  }
  return { id: data.user.id, email: data.user.email ?? null }
}
