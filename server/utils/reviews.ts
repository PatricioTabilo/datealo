import { desc, eq, sql } from 'drizzle-orm'
import { isUuid } from './validation'
import { reviews } from '../db/schema/reviews'

export type PublicReview = {
  id: string
  name: string
  rating: number
  comment: string | null
  verified: true
  createdAt: string
}

export type ReviewsSummary = {
  reviews: PublicReview[]
  ratingAverage: number | null
  reviewCount: number
}

const MAX_COMMENT_LENGTH = 500
const GENERIC_REVIEWER_NAME = 'un cliente de Datealo'

export function isValidRating(rating: unknown): rating is number {
  return typeof rating === 'number' && Number.isInteger(rating) && rating >= 1 && rating <= 5
}

// [...comment].length cuenta puntos de código, no unidades UTF-16 — para texto con emoji u otros
// caracteres fuera del plano básico, `.length` a secas cuenta el doble de lo que cuenta char_length()
// de Postgres (el check constraint de la tabla), rechazando comentarios que la base aceptaría igual.
export function isValidComment(comment: string | undefined): boolean {
  return comment === undefined || [...comment].length <= MAX_COMMENT_LENGTH
}

// El reemplazo por el nombre genérico ocurre al leer, no al guardar — así un cambio de copy no necesita
// backfill de filas ya escritas.
export function resolveReviewerName(name: string | null): string {
  return name ?? GENERIC_REVIEWER_NAME
}

function normalizeReviewerName(name: string | undefined): string | null {
  const trimmed = name?.trim()
  return trimmed ? trimmed : null
}

function toPublicReview(row: {
  id: string
  name: string | null
  rating: number
  comment: string | null
  createdAt: Date
}): PublicReview {
  return {
    id: row.id,
    name: resolveReviewerName(row.name),
    rating: row.rating,
    comment: row.comment,
    verified: true,
    createdAt: row.createdAt.toISOString(),
  }
}

// Upsert atómico por (professionalId, token) a nivel de base — una segunda reseña del mismo token
// reemplaza a la primera, nunca inserta una fila nueva. createdAt no se toca en el conflicto: es la
// fecha de la primera publicación, no la del reemplazo.
export async function upsertReview(
  professionalId: string,
  token: string,
  fields: { rating: number, comment?: string, name?: string },
): Promise<PublicReview> {
  const name = normalizeReviewerName(fields.name)
  const comment = fields.comment ?? null

  const [row] = await useDb()
    .insert(reviews)
    .values({ professionalId, token, rating: fields.rating, comment, name })
    .onConflictDoUpdate({
      target: [reviews.professionalId, reviews.token],
      set: { rating: fields.rating, comment, name, updatedAt: sql`now()` },
    })
    .returning({
      id: reviews.id,
      name: reviews.name,
      rating: reviews.rating,
      comment: reviews.comment,
      createdAt: reviews.createdAt,
    })

  // onConflictDoUpdate (a diferencia de onConflictDoNothing) siempre afecta exactamente una fila —
  // inserta o actualiza, nunca devuelve vacío.
  return toPublicReview(row!)
}

// Corre en paralelo con la lectura del perfil (Promise.all en el handler), incluso antes de saber si el
// profesional existe — por eso guarda el mismo chequeo de forma de id que ya hace findPublicProfessionalProfile,
// para no romper con un 22P02 de Postgres cuando el id ni siquiera tiene forma de uuid.
export async function findReviewsForProfessional(professionalId: string): Promise<ReviewsSummary> {
  if (!isUuid(professionalId)) {
    return { reviews: [], ratingAverage: null, reviewCount: 0 }
  }

  const rows = await useDb()
    .select({
      id: reviews.id,
      name: reviews.name,
      rating: reviews.rating,
      comment: reviews.comment,
      createdAt: reviews.createdAt,
    })
    .from(reviews)
    .where(eq(reviews.professionalId, professionalId))
    .orderBy(desc(reviews.updatedAt))

  if (rows.length === 0) {
    return { reviews: [], ratingAverage: null, reviewCount: 0 }
  }

  const average = rows.reduce((sum, row) => sum + row.rating, 0) / rows.length

  return {
    reviews: rows.map(toPublicReview),
    ratingAverage: Math.round(average * 10) / 10,
    reviewCount: rows.length,
  }
}
