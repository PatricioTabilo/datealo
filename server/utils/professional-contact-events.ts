import { professionalContactEvents } from '../db/schema/professional-contact-events'

// Sin cuenta ni sesión: quien contacta nunca queda identificado, a propósito. Devuelve false cuando el
// id no corresponde a ningún profesional, para que el handler responda 404 en vez de dejar que Postgres
// rechace el insert por violación de FK.
export async function registerProfessionalContact(professionalId: string): Promise<boolean> {
  if (!(await professionalExists(professionalId))) return false

  await useDb().insert(professionalContactEvents).values({ professionalId })
  return true
}
