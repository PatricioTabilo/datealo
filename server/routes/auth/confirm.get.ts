import { z } from 'zod'

// Nombres exactos que arma el template "Magic Link" configurado en Supabase Auth — no un contrato propio.
const querySchema = z.object({
  token_hash: z.string().min(1),
  type: z.literal('email'),
})

export default defineEventHandler(async (event) => {
  const query = querySchema.safeParse(getQuery(event))
  if (!query.success) {
    return sendRedirect(event, '/profesional/ingresar?error=enlace_invalido', 302)
  }

  // verifyOtp con token_hash, no el flujo PKCE (exchangeCodeForSession): PKCE exige que el mismo
  // navegador que pidió el enlace sea el que lo completa, y acá el enlace se toca a menudo desde la
  // app de correo, en otro navegador o dispositivo.
  const { data, error } = await serverSupabase(event).auth.verifyOtp(query.data)
  if (error || !data.user) {
    return sendRedirect(event, '/profesional/ingresar?error=enlace_invalido', 302)
  }

  const professional = await findProfessionalByUserId(data.user.id)
  return sendRedirect(event, professional ? '/profesional/perfil' : '/profesional/registro', 302)
})
