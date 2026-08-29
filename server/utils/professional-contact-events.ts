import { eq } from 'drizzle-orm'
import { isUuid } from './validation'
import { professionalContactEvents } from '../db/schema/professional-contact-events'
import { professionals } from '../db/schema/professionals'

// Sin cuenta ni sesión: quien contacta nunca queda identificado, a propósito (D-002 de producto,
// misión 05). Devuelve false cuando el id no corresponde a ningún profesional, para que el handler
// responda 404 en vez de dejar que Postgres rechace el insert por violación de FK.
export async function registerProfessionalContact(professionalId: string): Promise<boolean> {
  if (!isUuid(professionalId)) return false

  const [exists] = await useDb().select({ id: professionals.id }).from(professionals).where(eq(professionals.id, professionalId))
  if (!exists) return false

  await useDb().insert(professionalContactEvents).values({ professionalId })
  return true
}
