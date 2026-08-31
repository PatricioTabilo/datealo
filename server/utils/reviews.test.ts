import { describe, expect, it } from 'vitest'
import { isValidComment, isValidRating, resolveReviewerName } from './reviews'

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

describe('resolveReviewerName', () => {
  it('devuelve el nombre real de quien reseñó', () => {
    expect(resolveReviewerName('Carmen')).toBe('Carmen')
  })

  it('reemplaza null por el nombre genérico', () => {
    expect(resolveReviewerName(null)).toBe('un cliente de Datealo')
  })
})
