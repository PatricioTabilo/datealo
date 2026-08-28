import { createServerClient } from '@supabase/ssr'
import { parseCookies, setCookie } from 'h3'
import type { H3Event } from 'h3'

// Contrato de usuario autenticado: usar este tipo al interactuar con el usuario, nunca el `User`
// de Supabase directo.
export type AuthUser = {
  id: string
  email: string | null
}

// Exportado: server/routes/auth/confirm.get.ts necesita el mismo cliente para que verifyOtp() deje la
// sesión en la misma cookie que requireUser() sabe leer.
export function serverSupabase(event: H3Event) {
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
