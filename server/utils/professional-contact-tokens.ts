import { isUuid } from './validation'
import { professionalContactTokens } from '../db/schema/professional-contact-tokens'

// Silencioso ante un token ausente o mal formado — nunca bloquea el registro del contacto real que lo
// acompaña (D-002 de misión 05). Sentencia separada del insert del contacto: si esta falla por una razón
// ajena, el contacto ya quedó registrado.
export async function registerContactToken(professionalId: string, token: string | undefined): Promise<void> {
  if (!token || !isUuid(token)) return

  await useDb()
    .insert(professionalContactTokens)
    .values({ professionalId, token })
    .onConflictDoNothing({ target: [professionalContactTokens.professionalId, professionalContactTokens.token] })
}
