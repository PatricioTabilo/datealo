import { and, eq, inArray } from 'drizzle-orm'
import { findVecinasActivas } from './comunas'
import { comunas } from '../db/schema/comunas'
import { professionals } from '../db/schema/professionals'

export type SearchMatchType = 'exacta' | 'vecina' | 'ninguna'

export type SearchResultProfessional = {
  id: string
  displayName: string
  comunaNombre: string
  priceFrom: number | null
  avatarUrl: string | null
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

type ProfessionalSearchRow = {
  id: string
  displayName: string
  comunaNombre: string
  priceFrom: number | null
  avatarPath: string | null
  createdAt: Date
  photoPaths: string[]
  description: string | null
}

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

function toSearchResult(row: ProfessionalSearchRow): SearchResultProfessional {
  return {
    id: row.id,
    displayName: row.displayName,
    comunaNombre: row.comunaNombre,
    priceFrom: row.priceFrom,
    avatarUrl: buildAvatarUrl(row.avatarPath),
    createdAt: row.createdAt.toISOString(),
  }
}

function orderResults(rows: ProfessionalSearchRow[]): SearchResultProfessional[] {
  const ranked = rankByCompleteness(rows.map(toCompletenessInput))
  const rowById = new Map(rows.map(row => [row.id, row]))
  return ranked.map(({ id }) => toSearchResult(rowById.get(id)!))
}

async function findActiveProfessionals(
  categoriaSlug: string,
  comunaCodigos: string[],
): Promise<ProfessionalSearchRow[]> {
  return useDb()
    .select({
      id: professionals.id,
      displayName: professionals.displayName,
      comunaNombre: comunas.nombre,
      priceFrom: professionals.priceFrom,
      avatarPath: professionals.avatarPath,
      createdAt: professionals.createdAt,
      photoPaths: professionals.photoPaths,
      description: professionals.description,
    })
    .from(professionals)
    .innerJoin(comunas, eq(professionals.comunaCodigo, comunas.codigo))
    .where(and(
      eq(professionals.categoriaSlug, categoriaSlug),
      inArray(professionals.comunaCodigo, comunaCodigos),
      eq(professionals.active, true),
    ))
}

// Se une a comunas para excluir zonas que se desactivaron — "existe en otra parte de Chile" solo cuenta
// comunas donde alguien podría buscar hoy, no cualquier fila histórica de professionals.
async function existsActiveProfessionalForCategoria(categoriaSlug: string): Promise<boolean> {
  const [row] = await useDb()
    .select({ id: professionals.id })
    .from(professionals)
    .innerJoin(comunas, eq(professionals.comunaCodigo, comunas.codigo))
    .where(and(
      eq(professionals.categoriaSlug, categoriaSlug),
      eq(professionals.active, true),
      eq(comunas.activa, true),
    ))
    .limit(1)
  return Boolean(row)
}

export async function findSearchResults(categoriaSlug: string, comunaCodigo: string): Promise<SearchResult> {
  const exactRows = await findActiveProfessionals(categoriaSlug, [comunaCodigo])
  if (exactRows.length > 0) {
    return { results: orderResults(exactRows), matchType: 'exacta', categoryHasResultsInChile: true }
  }

  const vecinas = await findVecinasActivas(comunaCodigo)
  if (vecinas.length > 0) {
    const vecinaRows = await findActiveProfessionals(categoriaSlug, vecinas.map(vecina => vecina.codigo))
    if (vecinaRows.length > 0) {
      return { results: orderResults(vecinaRows), matchType: 'vecina', categoryHasResultsInChile: true }
    }
  }

  return {
    results: [],
    matchType: 'ninguna',
    categoryHasResultsInChile: await existsActiveProfessionalForCategoria(categoriaSlug),
  }
}
