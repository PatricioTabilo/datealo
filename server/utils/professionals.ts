import { eq } from 'drizzle-orm'
import { existsActiveCategoria } from './categorias'
import { existsActiveComuna } from './comunas'
import { professionals } from '../db/schema/professionals'

const CONTACT_REGEX = /^\+56\d{9}$/

export type ProfessionalFieldsInput = {
  displayName?: string
  categoriaSlug?: string
  comunaCodigo?: string
  contact?: string
}

export type ProfessionalFieldError = { error: string }

export type Professional = {
  id: string
  displayName: string
  categoriaSlug: string
  comunaCodigo: string
  contact: string
  description: string | null
  priceFrom: number | null
  photoUrls: string[]
  active: boolean
}

type ProfessionalRow = {
  id: string
  displayName: string
  categoriaSlug: string
  comunaCodigo: string
  contact: string
  description: string | null
  priceFrom: number | null
  photoPaths: string[]
  active: boolean
}

// select explícito de las columnas públicas — nunca la fila cruda de Drizzle, así una columna nueva en
// la tabla (una nota de moderación, un score interno) queda afuera de la respuesta por default.
const publicColumns = {
  id: professionals.id,
  displayName: professionals.displayName,
  categoriaSlug: professionals.categoriaSlug,
  comunaCodigo: professionals.comunaCodigo,
  contact: professionals.contact,
  description: professionals.description,
  priceFrom: professionals.priceFrom,
  photoPaths: professionals.photoPaths,
  active: professionals.active,
}

export function normalizeContact(value: string): string {
  return value.replace(/\s+/g, '')
}

export async function validateProfessionalFields(
  fields: ProfessionalFieldsInput,
): Promise<ProfessionalFieldError | null> {
  if (fields.categoriaSlug !== undefined && !(await existsActiveCategoria(fields.categoriaSlug))) {
    return { error: 'invalid_categoria' }
  }
  if (fields.comunaCodigo !== undefined && !(await existsActiveComuna(fields.comunaCodigo))) {
    return { error: 'invalid_comuna' }
  }
  if (fields.contact !== undefined && !CONTACT_REGEX.test(fields.contact)) {
    return { error: 'invalid_contact' }
  }
  return null
}

function toPublicProfessional(row: ProfessionalRow): Professional {
  const { public: pub } = useRuntimeConfig()
  return {
    id: row.id,
    displayName: row.displayName,
    categoriaSlug: row.categoriaSlug,
    comunaCodigo: row.comunaCodigo,
    contact: row.contact,
    description: row.description,
    priceFrom: row.priceFrom,
    photoUrls: row.photoPaths.map(
      path => `${pub.supabaseUrl}/storage/v1/object/public/professional-photos/${path}`,
    ),
    active: row.active,
  }
}

export async function findProfessionalByUserId(userId: string): Promise<Professional | null> {
  const [row] = await useDb().select(publicColumns).from(professionals).where(eq(professionals.userId, userId))
  return row ? toPublicProfessional(row) : null
}

export async function createProfessional(
  userId: string,
  fields: Required<ProfessionalFieldsInput>,
): Promise<{ professional: Professional, created: boolean }> {
  const [inserted] = await useDb()
    .insert(professionals)
    .values({ userId, ...fields })
    .onConflictDoNothing({ target: professionals.userId })
    .returning(publicColumns)

  if (inserted) {
    return { professional: toPublicProfessional(inserted), created: true }
  }

  // userId es unique — si el insert no devolvió fila es porque ya existía una, nunca porque el insert
  // falló en silencio.
  const existing = await findProfessionalByUserId(userId)
  return { professional: existing!, created: false }
}

function escapeHtml(value: string): string {
  const entities: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
  return value.replace(/[&<>"']/g, char => entities[char]!)
}

export function buildProfessionalWelcomeEmail({
  displayName,
  categoriaNombre,
  comunaNombre,
  profileUrl,
}: {
  displayName: string
  categoriaNombre: string
  comunaNombre: string
  profileUrl: string
}): { subject: string, html: string } {
  const firstName = escapeHtml(displayName.trim().split(/\s+/)[0] ?? displayName)

  return {
    subject: 'Tu perfil ya está publicado en Datealo',
    html: `
      <p>Hola ${firstName}, tu perfil de ${escapeHtml(categoriaNombre)} en ${escapeHtml(comunaNombre)} ya es
      visible en Datealo. Cualquiera que te busque ya puede encontrarte y contactarte.</p>
      <p>Todavía te faltan fotos de tus trabajos y tu precio: agrégalos para que la gente confíe más en
      ti.</p>
      <p><a href="${profileUrl}">Completar mi perfil</a></p>
    `.trim(),
  }
}
