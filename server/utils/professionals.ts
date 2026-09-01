import { and, eq, sql } from 'drizzle-orm'
import { existsActiveCategoria } from './categorias'
import { existsActiveComuna } from './comunas'
import { isUuid } from './validation'
import { categorias } from '../db/schema/categorias'
import { comunas } from '../db/schema/comunas'
import { professionals } from '../db/schema/professionals'

const CONTACT_REGEX = /^\+56\d{9}$/

export type ProfessionalCoreFields = {
  displayName: string
  categoriaSlug: string
  comunaCodigo: string
  contact: string
}

export type ProfessionalFieldsInput = Partial<ProfessionalCoreFields> & {
  description?: string | null
  priceFrom?: number | null
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
  avatarUrl: string | null
  active: boolean
}

// Forma que ve un buscador sin sesión (misión 05): categoría/comuna ya resueltas a su nombre (nunca el
// slug/código, que no significa nada para quien mira el perfil) y createdAt, que Professional no expone.
export type PublicProfessionalProfile = {
  id: string
  displayName: string
  categoriaNombre: string
  comunaNombre: string
  contact: string
  description: string | null
  priceFrom: number | null
  photoUrls: string[]
  avatarUrl: string | null
  createdAt: string
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
  avatarPath: string | null
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
  avatarPath: professionals.avatarPath,
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
  if (fields.priceFrom != null && (!Number.isInteger(fields.priceFrom) || fields.priceFrom <= 0)) {
    return { error: 'invalid_price' }
  }
  return null
}

// Compartido entre Professional (esta forma) y PublicProfessionalProfile (misión 05) — las dos guardan
// solo el path del bucket y calculan la URL pública recién al responder.
function buildPhotoUrls(photoPaths: string[]): string[] {
  const { public: pub } = useRuntimeConfig()
  return photoPaths.map(path => `${pub.supabaseUrl}/storage/v1/object/public/professional-photos/${path}`)
}

// Mismo patrón que buildPhotoUrls, para el único path de la foto de perfil en vez de un array.
function buildAvatarUrl(avatarPath: string | null): string | null {
  if (!avatarPath) return null
  const { public: pub } = useRuntimeConfig()
  return `${pub.supabaseUrl}/storage/v1/object/public/professional-photos/${avatarPath}`
}

function toPublicProfessional(row: ProfessionalRow): Professional {
  return {
    id: row.id,
    displayName: row.displayName,
    categoriaSlug: row.categoriaSlug,
    comunaCodigo: row.comunaCodigo,
    contact: row.contact,
    description: row.description,
    priceFrom: row.priceFrom,
    photoUrls: buildPhotoUrls(row.photoPaths),
    avatarUrl: buildAvatarUrl(row.avatarPath),
    active: row.active,
  }
}

// Sin sesión, para cualquiera (misión 05). categoriaNombre/comunaNombre se resuelven en la misma consulta
// (leftJoin) en vez de con findCategoriaNombre()/findComunaNombre() por separado — este endpoint es el
// de más tráfico esperado del diseño (destino de las cards de la futura misión 06), a diferencia del
// correo de bienvenida (buildProfessionalWelcomeEmail más abajo), que corre una vez por registro y sí
// puede pagar dos queries encadenadas.
export async function findPublicProfessionalProfile(id: string): Promise<PublicProfessionalProfile | null> {
  if (!isUuid(id)) return null

  const [row] = await useDb()
    .select({
      id: professionals.id,
      displayName: professionals.displayName,
      categoriaSlug: professionals.categoriaSlug,
      categoriaNombre: categorias.nombre,
      comunaCodigo: professionals.comunaCodigo,
      comunaNombre: comunas.nombre,
      contact: professionals.contact,
      description: professionals.description,
      priceFrom: professionals.priceFrom,
      photoPaths: professionals.photoPaths,
      avatarPath: professionals.avatarPath,
      createdAt: professionals.createdAt,
    })
    .from(professionals)
    .leftJoin(categorias, eq(professionals.categoriaSlug, categorias.slug))
    .leftJoin(comunas, eq(professionals.comunaCodigo, comunas.codigo))
    .where(and(eq(professionals.id, id), eq(professionals.active, true)))

  if (!row) return null

  return {
    id: row.id,
    displayName: row.displayName,
    categoriaNombre: row.categoriaNombre ?? row.categoriaSlug,
    comunaNombre: row.comunaNombre ?? row.comunaCodigo,
    contact: row.contact,
    description: row.description,
    priceFrom: row.priceFrom,
    photoUrls: buildPhotoUrls(row.photoPaths),
    avatarUrl: buildAvatarUrl(row.avatarPath),
    createdAt: row.createdAt.toISOString(),
  }
}

// No exige active — a diferencia de findPublicProfessionalProfile, esto lo usan flujos donde el
// profesional pudo haberse desactivado después de que el hecho que importa ya ocurrió (ej. publicar una
// reseña de un contacto real, misión 07), mismo criterio que ya usa registerProfessionalContact.
export async function professionalExists(id: string): Promise<boolean> {
  if (!isUuid(id)) return false
  const [row] = await useDb().select({ id: professionals.id }).from(professionals).where(eq(professionals.id, id))
  return Boolean(row)
}

export async function findProfessionalByUserId(userId: string): Promise<Professional | null> {
  const [row] = await useDb().select(publicColumns).from(professionals).where(eq(professionals.userId, userId))
  return row ? toPublicProfessional(row) : null
}

// Lo único que necesita el correo de aviso de reseña nueva (misión 07) — nunca active, que ya decidió
// professionalExists() que no aplica acá, y nunca ninguna otra columna.
export async function findProfessionalNotificationInfo(
  id: string,
): Promise<{ displayName: string, email: string | null } | null> {
  const [row] = await useDb()
    .select({ displayName: professionals.displayName, email: professionals.email })
    .from(professionals)
    .where(eq(professionals.id, id))
  return row ?? null
}

export async function createProfessional(
  userId: string,
  fields: ProfessionalCoreFields,
  email: string | null,
): Promise<{ professional: Professional, created: boolean }> {
  const [inserted] = await useDb()
    .insert(professionals)
    .values({ userId, ...fields, email })
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

export async function updateProfessional(
  userId: string,
  patch: ProfessionalFieldsInput,
): Promise<Professional | null> {
  const [updated] = await useDb()
    .update(professionals)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(professionals.userId, userId))
    .returning(publicColumns)
  return updated ? toPublicProfessional(updated) : null
}

export async function addProfessionalPhoto(userId: string, path: string): Promise<Professional | null> {
  const [updated] = await useDb()
    .update(professionals)
    .set({ photoPaths: sql`array_append(${professionals.photoPaths}, ${path})`, updatedAt: new Date() })
    .where(eq(professionals.userId, userId))
    .returning(publicColumns)
  return updated ? toPublicProfessional(updated) : null
}

export async function removeProfessionalPhoto(userId: string, path: string): Promise<Professional | null> {
  const [updated] = await useDb()
    .update(professionals)
    .set({ photoPaths: sql`array_remove(${professionals.photoPaths}, ${path})`, updatedAt: new Date() })
    .where(eq(professionals.userId, userId))
    .returning(publicColumns)
  return updated ? toPublicProfessional(updated) : null
}

// Path crudo, no la URL pública — lo usan avatar.post.ts y avatar.delete.ts para borrar el archivo
// viejo de Storage. El cliente solo ve avatarUrl, calculado por buildAvatarUrl.
export async function findProfessionalAvatarPath(userId: string): Promise<string | null> {
  const [row] = await useDb().select({ avatarPath: professionals.avatarPath }).from(professionals).where(eq(professionals.userId, userId))
  return row?.avatarPath ?? null
}

export async function setProfessionalAvatar(userId: string, path: string): Promise<Professional | null> {
  const [updated] = await useDb()
    .update(professionals)
    .set({ avatarPath: path, updatedAt: new Date() })
    .where(eq(professionals.userId, userId))
    .returning(publicColumns)
  return updated ? toPublicProfessional(updated) : null
}

export async function clearProfessionalAvatar(userId: string): Promise<Professional | null> {
  const [updated] = await useDb()
    .update(professionals)
    .set({ avatarPath: null, updatedAt: new Date() })
    .where(eq(professionals.userId, userId))
    .returning(publicColumns)
  return updated ? toPublicProfessional(updated) : null
}

// Chequea existencia del perfil y pertenencia de la foto en una sola query — evita reconstruir "no
// existe" a partir de dos casos distintos (perfil ausente vs. path que no está en photoPaths).
export async function professionalHasPhotoPath(userId: string, path: string): Promise<boolean> {
  const [row] = await useDb()
    .select({ id: professionals.id })
    .from(professionals)
    .where(sql`${professionals.userId} = ${userId} and ${path} = any(${professionals.photoPaths})`)
  return Boolean(row)
}

export function escapeHtml(value: string): string {
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
