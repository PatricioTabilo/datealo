import { sql } from 'drizzle-orm'
import { reviews } from '../db/schema/reviews'

export type PublicReview = {
  id: string
  name: string
  rating: number
  comment: string | null
  verified: true
  createdAt: string
}

const MAX_COMMENT_LENGTH = 500
const GENERIC_REVIEWER_NAME = 'un cliente de Datealo'

export function isValidRating(rating: unknown): rating is number {
  return typeof rating === 'number' && Number.isInteger(rating) && rating >= 1 && rating <= 5
}

export function isValidComment(comment: string | undefined): boolean {
  return comment === undefined || comment.length <= MAX_COMMENT_LENGTH
}

// D-002: el reemplazo por el nombre genérico ocurre al leer, no al guardar — así un cambio de copy no
// necesita backfill de filas ya escritas.
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

// Upsert atómico por (professionalId, token) a nivel de base (T-003) — una segunda reseña del mismo
// token reemplaza a la primera, nunca inserta una fila nueva (D-003, CL-003). createdAt no se toca en
// el conflicto: es la fecha de la primera publicación, no la del reemplazo.
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
