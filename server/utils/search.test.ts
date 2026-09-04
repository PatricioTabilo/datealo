import { beforeAll, describe, expect, it, vi } from 'vitest'
import { rankByCompleteness, toSearchResult, type ProfessionalCompletenessInput, type ProfessionalSearchRow } from './search'

// buildAvatarUrl/buildPhotoUrls llaman a useRuntimeConfig(), el auto-import de Nitro — no existe fuera de
// una request real, así que se stubea con la misma forma que el runtime expone en server/utils/professionals.ts.
beforeAll(() => {
  vi.stubGlobal('useRuntimeConfig', () => ({ public: { supabaseUrl: 'https://proyecto.supabase.co' } }))
})

function row(overrides: Partial<ProfessionalSearchRow> = {}): ProfessionalSearchRow {
  return {
    id: 'a',
    displayName: 'Marcela Fuentes',
    comunaNombre: 'Ñuñoa',
    priceFrom: null,
    avatarPath: null,
    createdAt: new Date('2026-01-01'),
    photoPaths: [],
    description: null,
    ...overrides,
  }
}

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

describe('toSearchResult', () => {
  it('con foto y reseñas, expone la primera foto y el resumen de rating', () => {
    const result = toSearchResult(
      row({ photoPaths: ['a/trabajo-1.jpg', 'a/trabajo-2.jpg'] }),
      { ratingAverage: 4.7, reviewCount: 2 },
    )

    expect(result.photoUrl).toBe('https://proyecto.supabase.co/storage/v1/object/public/professional-photos/a/trabajo-1.jpg')
    expect(result.ratingAverage).toBe(4.7)
    expect(result.reviewCount).toBe(2)
  })

  it('sin fotos ni reseñas, nunca 0 ni NaN en el rating', () => {
    const result = toSearchResult(row({ photoPaths: [] }), undefined)

    expect(result.photoUrl).toBeNull()
    expect(result.ratingAverage).toBeNull()
    expect(result.reviewCount).toBe(0)
  })
})
