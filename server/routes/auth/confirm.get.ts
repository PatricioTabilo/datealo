import { z } from 'zod'

// Nombres exactos que arma el template "Magic Link" de Supabase Auth (TR-001) — no un contrato propio.
const querySchema = z.object({
  token_hash: z.string().min(1),
  type: z.literal('email'),
})

export default defineEventHandler(async (event) => {
  const query = querySchema.safeParse(getQuery(event))
  if (!query.success) {
    return sendRedirect(event, '/profesional/ingresar?error=enlace_invalido', 302)
  }

  // T-001: verifyOtp con token_hash, no el flujo PKCE — así el enlace funciona abierto desde otro
  // navegador o dispositivo del que lo pidió.
  const { data, error } = await serverSupabase(event).auth.verifyOtp(query.data)
  if (error || !data.user) {
    return sendRedirect(event, '/profesional/ingresar?error=enlace_invalido', 302)
  }

  const professional = await findProfessionalByUserId(data.user.id)
  return sendRedirect(event, professional ? '/profesional/perfil' : '/profesional/registro', 302)
})
