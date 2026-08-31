import { and, eq } from 'drizzle-orm'
import { isUuid } from './validation'
import { professionalContactTokens } from '../db/schema/professional-contact-tokens'

// Silencioso ante un token ausente o mal formado — nunca bloquea el registro del contacto real que lo
// acompaña. Sentencia separada del insert del contacto: si esta falla por una razón ajena, el contacto
// ya quedó registrado.
export async function registerContactToken(professionalId: string, token: string | undefined): Promise<void> {
  if (!token || !isUuid(token)) return

  await useDb()
    .insert(professionalContactTokens)
    .values({ professionalId, token })
    .onConflictDoNothing({ target: [professionalContactTokens.professionalId, professionalContactTokens.token] })
}

// Una reseña solo se publica si existe un contacto real detrás de este token para este profesional.
export async function hasContactToken(professionalId: string, token: string): Promise<boolean> {
  if (!isUuid(token)) return false

  const [row] = await useDb()
    .select({ token: professionalContactTokens.token })
    .from(professionalContactTokens)
    .where(
      and(
        eq(professionalContactTokens.professionalId, professionalId),
        eq(professionalContactTokens.token, token),
      ),
    )

  return Boolean(row)
}
