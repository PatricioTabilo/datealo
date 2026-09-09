import { and, eq, inArray } from 'drizzle-orm'
import { findVecinasActivas } from './comunas'
import { buildAvatarUrl, buildPhotoUrls } from './professionals'
import { findRatingSummaries, type RatingSummary } from './reviews'
import { comunas } from '../db/schema/comunas'
import { professionalCategorias } from '../db/schema/professional-categorias'
import { professionalComunas } from '../db/schema/professional-comunas'
import { professionals } from '../db/schema/professionals'

export type SearchMatchType = 'exacta' | 'vecina' | 'ninguna'

export type SearchResultProfessional = {
  id: string
  displayName: string
  comunaNombre: string
  priceFrom: number | null
  avatarUrl: string | null
  photoUrl: string | null
  ratingAverage: number | null
  reviewCount: number
  createdAt: string
}

export type SearchResult = {
  results: SearchResultProfessional[]
  matchType: SearchMatchType
  categoryHasResultsInChile: boolean
}

// La forma mínima que necesita el orden, no la fila completa de professionals — evita atar el criterio
// a columnas que no usa (contacto, categoría, estado activo).
export type ProfessionalCompletenessInput = {
  id: string
  createdAt: Date
  hasPhotos: boolean
  hasDescription: boolean
  hasPrice: boolean
}

export type ProfessionalSearchRow = {
  id: string
  displayName: string
  comunaNombre: string
  priceFrom: number | null
  avatarPath: string | null
  createdAt: Date
  photoPaths: string[]
  description: string | null
}

// Fila cruda de la query de findActiveProfessionals, antes de agrupar por profesional — un profesional
// con 2+ comunas puede aparecer más de una vez si matchea por más de una comuna del conjunto buscado a
// la vez (ver groupByMatchedComuna).
type ProfessionalSearchQueryRow = ProfessionalSearchRow & { comunaCodigo: string }

function completenessScore(input: ProfessionalCompletenessInput): number {
  return Number(input.hasPhotos) + Number(input.hasDescription) + Number(input.hasPrice)
}

// Sin Drizzle ni forma de professionals: el día que exista una señal real de calidad (reseñas, tasa de
// respuesta) el criterio cambia acá, sin tocar cómo se leen los profesionales.
export function rankByCompleteness(
  inputs: ProfessionalCompletenessInput[],
): ProfessionalCompletenessInput[] {
  return [...inputs].sort((a, b) =>
    completenessScore(b) - completenessScore(a)
    || a.createdAt.getTime() - b.createdAt.getTime()
    || a.id.localeCompare(b.id),
  )
}

function toCompletenessInput(row: ProfessionalSearchRow): ProfessionalCompletenessInput {
  return {
    id: row.id,
    createdAt: row.createdAt,
    hasPhotos: row.photoPaths.length > 0,
    hasDescription: Boolean(row.description),
    hasPrice: row.priceFrom != null,
  }
}

export function toSearchResult(row: ProfessionalSearchRow, rating: RatingSummary | undefined): SearchResultProfessional {
  return {
    id: row.id,
    displayName: row.displayName,
    comunaNombre: row.comunaNombre,
    priceFrom: row.priceFrom,
    avatarUrl: buildAvatarUrl(row.avatarPath),
    photoUrl: buildPhotoUrls(row.photoPaths)[0] ?? null,
    ratingAverage: rating?.ratingAverage ?? null,
    reviewCount: rating?.reviewCount ?? 0,
    createdAt: row.createdAt.toISOString(),
  }
}

// Función pura, sin Drizzle: decide cuál de las comunas coincidentes de un profesional se muestra cuando
// matchea por más de una a la vez, sin enterrar esa regla de negocio en SQL (mismo criterio que
// rankByCompleteness). Reusa el orden alfabético que ya fija toda esta misión — determinístico, nunca
// varía entre requests para el mismo profesional y el mismo conjunto de comunas buscadas.
export function pickMatchedComuna(
  candidatas: { codigo: string, nombre: string }[],
): { codigo: string, nombre: string } {
  return [...candidatas].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))[0]!
}

// Agrupa las filas crudas por profesional y resuelve, con pickMatchedComuna, cuál de sus comunas
// coincidentes queda como comunaNombre — el resto de los campos son iguales entre las filas de un mismo
// profesional (no dependen de la comuna), así que se toman de la primera del grupo.
function groupByMatchedComuna(rows: ProfessionalSearchQueryRow[]): ProfessionalSearchRow[] {
  const byId = new Map<string, ProfessionalSearchQueryRow[]>()
  for (const row of rows) {
    const group = byId.get(row.id)
    if (group) group.push(row)
    else byId.set(row.id, [row])
  }

  return [...byId.values()].map((group) => {
    const matched = pickMatchedComuna(group.map(r => ({ codigo: r.comunaCodigo, nombre: r.comunaNombre })))
    return { ...group[0]!, comunaNombre: matched.nombre }
  })
}

async function orderResults(rows: ProfessionalSearchRow[]): Promise<SearchResultProfessional[]> {
  const ranked = rankByCompleteness(rows.map(toCompletenessInput))
  const rowById = new Map(rows.map(row => [row.id, row]))
  const ratings = await findRatingSummaries(rows.map(row => row.id))
  return ranked.map(({ id }) => toSearchResult(rowById.get(id)!, ratings.get(id)))
}

async function findActiveProfessionals(
  categoriaSlug: string,
  comunaCodigos: string[],
): Promise<ProfessionalSearchRow[]> {
  const rows = await useDb()
    .select({
      id: professionals.id,
      displayName: professionals.displayName,
      comunaCodigo: professionalComunas.comunaCodigo,
      comunaNombre: comunas.nombre,
      priceFrom: professionalCategorias.priceFrom,
      avatarPath: professionals.avatarPath,
      createdAt: professionals.createdAt,
      photoPaths: professionals.photoPaths,
      description: professionalCategorias.description,
    })
    .from(professionals)
    .innerJoin(professionalComunas, eq(professionalComunas.professionalId, professionals.id))
    .innerJoin(comunas, eq(professionalComunas.comunaCodigo, comunas.codigo))
    .innerJoin(professionalCategorias, and(
      eq(professionalCategorias.professionalId, professionals.id),
      eq(professionalCategorias.categoriaSlug, categoriaSlug),
    ))
    .where(and(
      inArray(professionalComunas.comunaCodigo, comunaCodigos),
      eq(professionals.active, true),
    ))

  return groupByMatchedComuna(rows)
}

// Se une a comunas para excluir zonas que se desactivaron — "existe en otra parte de Chile" solo cuenta
// comunas donde alguien podría buscar hoy, no cualquier fila histórica de professionals. El join contra
// professional_categorias es el filtro: un profesional cuenta acá solo si esa categoría puntual está
// entre las que declaró, nunca por tener cualquier otra.
async function existsActiveProfessionalForCategoria(categoriaSlug: string): Promise<boolean> {
  const [row] = await useDb()
    .select({ id: professionals.id })
    .from(professionals)
    .innerJoin(professionalComunas, eq(professionalComunas.professionalId, professionals.id))
    .innerJoin(comunas, eq(professionalComunas.comunaCodigo, comunas.codigo))
    .innerJoin(professionalCategorias, and(
      eq(professionalCategorias.professionalId, professionals.id),
      eq(professionalCategorias.categoriaSlug, categoriaSlug),
    ))
    .where(and(
      eq(professionals.active, true),
      eq(comunas.activa, true),
    ))
    .limit(1)
  return Boolean(row)
}

export async function findSearchResults(categoriaSlug: string, comunaCodigo: string): Promise<SearchResult> {
  const exactRows = await findActiveProfessionals(categoriaSlug, [comunaCodigo])
  if (exactRows.length > 0) {
    return { results: await orderResults(exactRows), matchType: 'exacta', categoryHasResultsInChile: true }
  }

  const vecinas = await findVecinasActivas(comunaCodigo)
  if (vecinas.length > 0) {
    const vecinaRows = await findActiveProfessionals(categoriaSlug, vecinas.map(vecina => vecina.codigo))
    if (vecinaRows.length > 0) {
      return { results: await orderResults(vecinaRows), matchType: 'vecina', categoryHasResultsInChile: true }
    }
  }

  return {
    results: [],
    matchType: 'ninguna',
    categoryHasResultsInChile: await existsActiveProfessionalForCategoria(categoriaSlug),
  }
}
