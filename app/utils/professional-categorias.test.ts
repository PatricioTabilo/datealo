import { describe, expect, it } from 'vitest'
import { resolveCategoriaContext } from './professional-categorias'
import type { PublicCategoria } from '~/types/professional'

function categoria(slug: string, priceFrom: number | null = null): PublicCategoria {
  return { slug, nombre: slug, priceFrom, description: null }
}

describe('resolveCategoriaContext', () => {
  it('usa la categoría del slug de contexto cuando matchea una declarada', () => {
    const categorias = [categoria('gasfiteria'), categoria('electricidad')]
    const result = resolveCategoriaContext(categorias, 'electricidad')
    expect(result.categoria.slug).toBe('electricidad')
    expect(result.secondary.map(c => c.slug)).toEqual(['gasfiteria'])
  })

  it('cae a la primera categoría declarada sin slug de contexto', () => {
    const categorias = [categoria('gasfiteria'), categoria('electricidad')]
    const result = resolveCategoriaContext(categorias)
    expect(result.categoria.slug).toBe('gasfiteria')
    expect(result.secondary.map(c => c.slug)).toEqual(['electricidad'])
  })

  it('cae a la primera categoría declarada si el slug de contexto no matchea ninguna', () => {
    const categorias = [categoria('gasfiteria'), categoria('electricidad')]
    const result = resolveCategoriaContext(categorias, 'pintura')
    expect(result.categoria.slug).toBe('gasfiteria')
  })

  it('secondary queda vacío con una sola categoría declarada', () => {
    const result = resolveCategoriaContext([categoria('gasfiteria')])
    expect(result.categoria.slug).toBe('gasfiteria')
    expect(result.secondary).toEqual([])
  })
})
