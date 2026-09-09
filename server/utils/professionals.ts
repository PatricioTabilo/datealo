import { and, asc, eq, sql } from 'drizzle-orm'
import { existsActiveCategoria } from './categorias'
import { existsActiveComuna } from './comunas'
import {
  createProfessionalCategoria,
  findProfessionalCategorias,
  type PublicCategoria,
} from './professional-categorias'
import { isUuid } from './validation'
import { comunas } from '../db/schema/comunas'
import { professionalComunas } from '../db/schema/professional-comunas'
import { professionals } from '../db/schema/professionals'

const CONTACT_REGEX = /^\+56\d{9}$/

export type ProfessionalCoreFields = {
  displayName: string
  categoriaSlug: string
  comunaCodigo: string
  contact: string
}

// Lo que PATCH /me puede tocar de la fila de professionals — ya sin categoriaSlug/priceFrom/description,
// que ahora se editan siempre por categoría vía /me/categorias/*.
export type ProfessionalPatch = Partial<Pick<ProfessionalCoreFields, 'displayName' | 'comunaCodigo' | 'contact'>>

// Campos de creación de POST /api/professionals — comunaCodigos (conjunto) reemplaza a comunaCodigo
// (ProfessionalCoreFields) en el body de este endpoint; comunaCodigo sigue vivo ahí solo para
// ProfessionalPatch/PATCH /me, que todavía no migró (S-003).
export type ProfessionalCreateFields = {
  displayName: string
  categoriaSlug: string
  comunaCodigos: string[]
  contact: string
}

// Usado para el patch de professionals (displayName/comunaCodigo/contact), la creación
// (displayName/categoriaSlug/comunaCodigos/contact) y el patch de una categoría puntual
// (categoriaSlug/priceFrom/description vía /me/categorias/*) — validateProfessionalFields es genérica
// sobre las tres, cada endpoint le pasa solo los campos que le tocan.
export type ProfessionalFieldsInput = Partial<ProfessionalCoreFields> & {
  comunaCodigos?: string[]
  description?: string | null
  priceFrom?: number | null
}

export type ProfessionalFieldError = { error: string }

export type Professional = {
  id: string
  displayName: string
  comunaCodigo: string
  contact: string
  photoUrls: string[]
  avatarUrl: string | null
  active: boolean
}

// Forma que ve un buscador sin sesión (misión 05): categoría/comuna ya resueltas a su nombre (nunca el
// slug/código, que no significa nada para quien mira el perfil) y createdAt, que Professional no expone.
export type PublicProfessionalProfile = {
  id: string
  displayName: string
  comunaNombre: string
  contact: string
  categorias: PublicCategoria[]
  photoUrls: string[]
  avatarUrl: string | null
  createdAt: string
}

type ProfessionalRow = {
  id: string
  displayName: string
  comunaCodigo: string
  contact: string
  photoPaths: string[]
  avatarPath: string | null
  active: boolean
}

// select explícito de las columnas públicas — nunca la fila cruda de Drizzle, así una columna nueva en
// la tabla (una nota de moderación, un score interno) queda afuera de la respuesta por default.
const publicColumns = {
  id: professionals.id,
  displayName: professionals.displayName,
  comunaCodigo: professionals.comunaCodigo,
  contact: professionals.contact,
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
  if (fields.comunaCodigos !== undefined) {
    for (const codigo of fields.comunaCodigos) {
      if (!(await existsActiveComuna(codigo))) return { error: 'invalid_comuna' }
    }
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
export function buildPhotoUrls(photoPaths: string[]): string[] {
  const { public: pub } = useRuntimeConfig()
  return photoPaths.map(path => `${pub.supabaseUrl}/storage/v1/object/public/professional-photos/${path}`)
}

// Mismo patrón que buildPhotoUrls, para el único path de la foto de perfil en vez de un array.
export function buildAvatarUrl(avatarPath: string | null): string | null {
  if (!avatarPath) return null
  const { public: pub } = useRuntimeConfig()
  return `${pub.supabaseUrl}/storage/v1/object/public/professional-photos/${avatarPath}`
}

function toPublicProfessional(row: ProfessionalRow): Professional {
  return {
    id: row.id,
    displayName: row.displayName,
    comunaCodigo: row.comunaCodigo,
    contact: row.contact,
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
      comunaCodigo: professionals.comunaCodigo,
      comunaNombre: comunas.nombre,
      contact: professionals.contact,
      photoPaths: professionals.photoPaths,
      avatarPath: professionals.avatarPath,
      createdAt: professionals.createdAt,
    })
    .from(professionals)
    .leftJoin(comunas, eq(professionals.comunaCodigo, comunas.codigo))
    .where(and(eq(professionals.id, id), eq(professionals.active, true)))

  if (!row) return null

  return {
    id: row.id,
    displayName: row.displayName,
    comunaNombre: row.comunaNombre ?? row.comunaCodigo,
    contact: row.contact,
    categorias: await findProfessionalCategorias(row.id),
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

// Alfabético por nombre — mismo orden que ya usa findActiveComunas, y el que toda esta misión asume
// para no tener que reordenar en ningún consumidor.
export async function findProfessionalComunas(professionalId: string): Promise<{ codigo: string, nombre: string }[]> {
  return useDb()
    .select({ codigo: professionalComunas.comunaCodigo, nombre: comunas.nombre })
    .from(professionalComunas)
    .innerJoin(comunas, eq(professionalComunas.comunaCodigo, comunas.codigo))
    .where(eq(professionalComunas.professionalId, professionalId))
    .orderBy(asc(comunas.nombre))
}

export type ProfessionalProfile = Professional & { categorias: PublicCategoria[] }

export async function findProfessionalProfileByUserId(userId: string): Promise<ProfessionalProfile | null> {
  const professional = await findProfessionalByUserId(userId)
  if (!professional) return null

  return { ...professional, categorias: await findProfessionalCategorias(professional.id) }
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
  fields: ProfessionalCreateFields,
  email: string | null,
): Promise<{ professional: Professional & { comunas: { codigo: string, nombre: string }[] }, created: boolean }> {
  const { categoriaSlug, comunaCodigos, displayName, contact } = fields

  const inserted = await useDb().transaction(async (tx) => {
    const [professional] = await tx
      .insert(professionals)
      // comunaCodigo sigue siendo NOT NULL en professionals hasta S-006 — se le escribe la primera
      // comuna del conjunto (comunaCodigos siempre trae al menos un elemento, ya validado antes de
      // llegar acá) mientras conviven las dos fuentes de verdad.
      .values({ userId, displayName, contact, comunaCodigo: comunaCodigos[0]!, email })
      .onConflictDoNothing({ target: professionals.userId })
      .returning(publicColumns)

    if (!professional) return null

    await createProfessionalCategoria(tx, professional.id, categoriaSlug)
    await tx.insert(professionalComunas).values(
      comunaCodigos.map(comunaCodigo => ({ professionalId: professional.id, comunaCodigo })),
    )
    return professional
  })

  if (inserted) {
    return { professional: { ...toPublicProfessional(inserted), comunas: await findProfessionalComunas(inserted.id) }, created: true }
  }

  // userId es unique — si el insert no devolvió fila es porque ya existía una, nunca porque el insert
  // falló en silencio.
  const existing = await findProfessionalByUserId(userId)
  return { professional: { ...existing!, comunas: await findProfessionalComunas(existing!.id) }, created: false }
}

// Devuelve el perfil con categorias (no solo Professional): el cliente guarda esta respuesta como su
// único estado del perfil propio (useProfessionalProfile), y perfil.vue necesita categorias ahí aunque
// esta escritura puntual no la haya tocado — perderla haría desaparecer los bloques de categoría hasta
// el próximo reload.
export async function updateProfessional(userId: string, patch: ProfessionalPatch): Promise<ProfessionalProfile | null> {
  const [row] = await useDb()
    .update(professionals)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(professionals.userId, userId))
    .returning(publicColumns)

  if (!row) return null

  const professional = toPublicProfessional(row)
  return { ...professional, categorias: await findProfessionalCategorias(professional.id) }
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
