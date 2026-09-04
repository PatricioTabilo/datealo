import { describe, expect, it } from 'vitest'
import { buildReviewNotificationEmail, computeRatingAverage, groupRatingsByProfessional, isValidComment, isValidRating, resolveReviewerName } from './reviews'

describe('isValidRating', () => {
  it('acepta enteros de 1 a 5', () => {
    expect(isValidRating(1)).toBe(true)
    expect(isValidRating(5)).toBe(true)
  })

  it('rechaza fuera de rango, no enteros y no números', () => {
    expect(isValidRating(0)).toBe(false)
    expect(isValidRating(6)).toBe(false)
    expect(isValidRating(3.5)).toBe(false)
    expect(isValidRating('5')).toBe(false)
    expect(isValidRating(undefined)).toBe(false)
  })
})

describe('isValidComment', () => {
  it('acepta ausente y hasta 500 caracteres', () => {
    expect(isValidComment(undefined)).toBe(true)
    expect(isValidComment('a'.repeat(500))).toBe(true)
  })

  it('rechaza más de 500 caracteres', () => {
    expect(isValidComment('a'.repeat(501))).toBe(false)
  })

  it('cuenta emoji como un caracter, igual que char_length() de Postgres', () => {
    // '🎉'.length en JS es 2 (par subrogado UTF-16) — contarlo así rechazaría comentarios que el check
    // constraint de la base (que cuenta puntos de código) acepta sin problema.
    expect(isValidComment('🎉'.repeat(500))).toBe(true)
    expect(isValidComment('🎉'.repeat(501))).toBe(false)
  })
})

describe('computeRatingAverage', () => {
  it('redondea a un decimal', () => {
    expect(computeRatingAverage([5, 4])).toBe(4.5)
    expect(computeRatingAverage([5, 5, 4])).toBe(4.7)
  })

  it('devuelve el rating tal cual con una sola reseña', () => {
    expect(computeRatingAverage([3])).toBe(3)
  })
})

describe('groupRatingsByProfessional', () => {
  it('agrupa cada rating bajo su propio profesional, mezclados en la misma lista', () => {
    const groups = groupRatingsByProfessional([
      { professionalId: 'a', rating: 5 },
      { professionalId: 'b', rating: 3 },
      { professionalId: 'a', rating: 4 },
      { professionalId: 'a', rating: 5 },
      { professionalId: 'b', rating: 2 },
    ])

    expect(groups.get('a')).toEqual([5, 4, 5])
    expect(groups.get('b')).toEqual([3, 2])
  })

  it('lista vacía devuelve un Map vacío', () => {
    expect(groupRatingsByProfessional([]).size).toBe(0)
  })
})

describe('resolveReviewerName', () => {
  it('devuelve el nombre real de quien reseñó', () => {
    expect(resolveReviewerName('Carmen')).toBe('Carmen')
  })

  it('reemplaza null por el nombre genérico', () => {
    expect(resolveReviewerName(null)).toBe('un cliente de Datealo')
  })
})

describe('buildReviewNotificationEmail', () => {
  const base = {
    displayName: 'Marcelo Rojas',
    profileUrl: 'https://datealo.cl/profesionales/abc-123',
  }

  it('el asunto nunca cambia con el rating', () => {
    const uno = buildReviewNotificationEmail({ ...base, reviewerName: 'Carmen', rating: 1, comment: null })
    const cinco = buildReviewNotificationEmail({ ...base, reviewerName: 'Carmen', rating: 5, comment: null })

    expect(uno.subject).toBe('Marcelo, te llegó una reseña nueva')
    expect(cinco.subject).toBe(uno.subject)
  })

  it('usa el nombre de quien reseñó cuando existe', () => {
    const { html } = buildReviewNotificationEmail({ ...base, reviewerName: 'Carmen', rating: 4, comment: null })
    expect(html).toContain('Carmen te dejó una reseña en Datealo:')
  })

  it('sin nombre, usa el reemplazo genérico en una frase distinta', () => {
    const { html } = buildReviewNotificationEmail({ ...base, reviewerName: undefined, rating: 4, comment: null })
    expect(html).toContain('Te llegó una reseña de un cliente de Datealo:')
  })

  it('un nombre en blanco cuenta como sin nombre', () => {
    const { html } = buildReviewNotificationEmail({ ...base, reviewerName: '   ', rating: 4, comment: null })
    expect(html).toContain('Te llegó una reseña de un cliente de Datealo:')
  })

  it('muestra el comentario completo cuando existe', () => {
    const { html } = buildReviewNotificationEmail({
      ...base,
      reviewerName: 'Carmen',
      rating: 5,
      comment: 'Llegó puntual y dejó todo funcionando.',
    })
    expect(html).toContain('Llegó puntual y dejó todo funcionando.')
  })

  it('sin comentario, no deja ninguna línea vacía en su lugar', () => {
    const { html } = buildReviewNotificationEmail({ ...base, reviewerName: 'Carmen', rating: 5, comment: null })
    expect(html).not.toContain('<p></p>')
  })

  it('las estrellas reflejan el rating exacto, llenas primero', () => {
    const { html } = buildReviewNotificationEmail({ ...base, reviewerName: 'Carmen', rating: 2, comment: null })
    expect(html).toContain('★★☆☆☆')
  })

  it('escapa HTML en el nombre y el comentario', () => {
    const { html } = buildReviewNotificationEmail({
      ...base,
      reviewerName: '<b>Carmen</b>',
      rating: 5,
      comment: '<script>alert(1)</script>',
    })
    expect(html).not.toContain('<b>Carmen</b>')
    expect(html).not.toContain('<script>alert(1)</script>')
  })
})
