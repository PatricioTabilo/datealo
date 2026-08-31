import { desc, eq, sql } from 'drizzle-orm'
import { escapeHtml } from './professionals'
import { isUuid } from './validation'
import { reviews } from '../db/schema/reviews'

// updatedAt, no createdAt: un reemplazo cambia lo que la reseña dice, y la fecha que se muestra tiene
// que reflejar eso — la misma columna por la que ya se ordena la lista.
export type PublicReview = {
  id: string
  name: string
  rating: number
  comment: string | null
  updatedAt: string
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

export function computeRatingAverage(ratings: number[]): number {
  const sum = ratings.reduce((total, rating) => total + rating, 0)
  return Math.round((sum / ratings.length) * 10) / 10
}

function toPublicReview(row: {
  id: string
  name: string | null
  rating: number
  comment: string | null
  updatedAt: Date
}): PublicReview {
  return {
    id: row.id,
    name: resolveReviewerName(row.name),
    rating: row.rating,
    comment: row.comment,
    updatedAt: row.updatedAt.toISOString(),
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
      updatedAt: reviews.updatedAt,
    })

  // onConflictDoUpdate (a diferencia de onConflictDoNothing) siempre afecta exactamente una fila —
  // inserta o actualiza, nunca devuelve vacío.
  return toPublicReview(row!)
}

// Guarda el mismo chequeo de forma de id que ya hace findPublicProfessionalProfile, para no romper con
// un 22P02 de Postgres cuando el id ni siquiera tiene forma de uuid.
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
      updatedAt: reviews.updatedAt,
    })
    .from(reviews)
    .where(eq(reviews.professionalId, professionalId))
    .orderBy(desc(reviews.updatedAt))

  if (rows.length === 0) {
    return { reviews: [], ratingAverage: null, reviewCount: 0 }
  }

  return {
    reviews: rows.map(toPublicReview),
    ratingAverage: computeRatingAverage(rows.map(row => row.rating)),
    reviewCount: rows.length,
  }
}

// El asunto nunca adelanta el rating (ni número ni estrellas): una reseña de 1 estrella con eso en el
// asunto se leería duro antes de que el profesional tenga cualquier contexto. Mismo asunto para las
// cinco notas posibles.
export function buildReviewNotificationEmail({
  displayName,
  reviewerName,
  rating,
  comment,
  profileUrl,
}: {
  displayName: string
  reviewerName: string | undefined
  rating: number
  comment: string | null
  profileUrl: string
}): { subject: string, html: string } {
  const firstName = escapeHtml(displayName.trim().split(/\s+/)[0] ?? displayName)
  const name = normalizeReviewerName(reviewerName)
  const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating)

  const intro = name
    ? `${escapeHtml(name)} te dejó una reseña en Datealo:`
    : `Te llegó una reseña de ${GENERIC_REVIEWER_NAME}:`

  return {
    subject: `${firstName}, te llegó una reseña nueva`,
    html: `
      <p>${intro}</p>
      <p style="font-size: 20px; letter-spacing: 2px;">${stars}</p>
      ${comment ? `<p>${escapeHtml(comment)}</p>` : ''}
      <p><a href="${profileUrl}">Ver mi perfil</a></p>
    `.trim(),
  }
}
