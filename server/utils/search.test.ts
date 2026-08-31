import { describe, expect, it } from 'vitest'
import { rankByCompleteness, type ProfessionalCompletenessInput } from './search'

function input(overrides: Partial<ProfessionalCompletenessInput> = {}): ProfessionalCompletenessInput {
  return {
    id: 'a',
    createdAt: new Date('2026-01-01'),
    hasPhotos: false,
    hasDescription: false,
    hasPrice: false,
    ...overrides,
  }
}

describe('rankByCompleteness', () => {
  it('un perfil con fotos, descripción y precio queda antes que uno con solo los campos obligatorios', () => {
    const completo = input({ id: 'completo', hasPhotos: true, hasDescription: true, hasPrice: true })
    const minimo = input({ id: 'minimo' })

    expect(rankByCompleteness([minimo, completo]).map(r => r.id)).toEqual(['completo', 'minimo'])
  })

  it('con la misma completitud, gana el más antiguo', () => {
    const viejo = input({ id: 'viejo', createdAt: new Date('2026-01-01') })
    const nuevo = input({ id: 'nuevo', createdAt: new Date('2026-06-01') })

    expect(rankByCompleteness([nuevo, viejo]).map(r => r.id)).toEqual(['viejo', 'nuevo'])
  })

  it('con la misma completitud y la misma fecha, gana el id menor', () => {
    const b = input({ id: 'b' })
    const a = input({ id: 'a' })

    expect(rankByCompleteness([b, a]).map(r => r.id)).toEqual(['a', 'b'])
  })
})
