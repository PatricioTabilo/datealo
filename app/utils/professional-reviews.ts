import type { PublicReview } from '~/types/review'

// La reseña publicada va primero — si ya existía una del mismo id (reemplazo, D-003), la vieja
// desaparece de la lista en vez de quedar duplicada.
export function upsertLocalReview(reviews: PublicReview[], published: PublicReview): PublicReview[] {
  return [published, ...reviews.filter(review => review.id !== published.id)]
}

export function averageRating(reviews: PublicReview[]): number | null {
  if (reviews.length === 0) return null

  const sum = reviews.reduce((total, review) => total + review.rating, 0)
  return Math.round((sum / reviews.length) * 10) / 10
}
