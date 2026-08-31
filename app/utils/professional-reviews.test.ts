import { describe, expect, it } from 'vitest'
import { averageRating, upsertLocalReview } from './professional-reviews'
import type { PublicReview } from '~/types/review'

function review(id: string, rating: number): PublicReview {
  return { id, name: 'Carmen', rating, comment: null, updatedAt: '2026-08-31T00:00:00.000Z' }
}

describe('upsertLocalReview', () => {
  it('agrega una reseña nueva al principio', () => {
    const result = upsertLocalReview([review('a', 4)], review('b', 5))
    expect(result.map(r => r.id)).toEqual(['b', 'a'])
  })

  it('reemplaza una reseña existente por id, sin duplicar', () => {
    const result = upsertLocalReview([review('a', 4), review('b', 5)], review('a', 3))
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual(review('a', 3))
  })
})

describe('averageRating', () => {
  it('devuelve null sin reseñas', () => {
    expect(averageRating([])).toBeNull()
  })

  it('redondea a un decimal', () => {
    expect(averageRating([review('a', 5), review('b', 4)])).toBe(4.5)
  })
})
