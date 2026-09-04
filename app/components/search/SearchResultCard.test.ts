// @vitest-environment jsdom
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import SearchResultCard from './SearchResultCard.vue'
import type { SearchResultProfessional } from '~/types/search'

// NuxtLink no existe fuera de un contexto Nuxt real — se stubea con un <a> real, mismo criterio que
// CatalogSelect.test.ts stubea UInput/UButton con lo mínimo que el test necesita inspeccionar.
const NuxtLinkStub = {
  props: ['to'],
  template: '<a :href="typeof to === \'string\' ? to : to.path"><slot /></a>',
}

function professional(overrides: Partial<SearchResultProfessional> = {}): SearchResultProfessional {
  return {
    id: 'abc-123',
    displayName: 'Marcela Fuentes',
    comunaNombre: 'Ñuñoa',
    priceFrom: null,
    avatarUrl: null,
    photoUrl: null,
    ratingAverage: null,
    reviewCount: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function mountCard(props: { professional: SearchResultProfessional, vecina?: boolean }) {
  return mount(SearchResultCard, {
    props,
    global: { stubs: { NuxtLink: NuxtLinkStub } },
  })
}

describe('SearchResultCard', () => {
  it('con foto de trabajo, muestra la foto y omite el fallback de avatar', () => {
    const wrapper = mountCard({ professional: professional({ photoUrl: 'https://cdn.test/foto.jpg' }) })
    const img = wrapper.find('img')
    expect(img.attributes('src')).toBe('https://cdn.test/foto.jpg')
    expect(wrapper.text()).not.toContain('MF')
  })

  it('sin foto de trabajo, cae al fallback con avatar', () => {
    const wrapper = mountCard({ professional: professional({ avatarUrl: 'https://cdn.test/avatar.jpg' }) })
    const imgs = wrapper.findAll('img')
    expect(imgs).toHaveLength(1)
    expect(imgs[0]!.attributes('src')).toBe('https://cdn.test/avatar.jpg')
  })

  it('sin foto ni avatar, cae a las iniciales', () => {
    const wrapper = mountCard({ professional: professional({ displayName: 'Marcela Fuentes' }) })
    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.text()).toContain('MF')
  })

  it('con reseñas, muestra el promedio con coma decimal y la cantidad', () => {
    const wrapper = mountCard({ professional: professional({ ratingAverage: 4.7, reviewCount: 12 }) })
    expect(wrapper.text()).toContain('4,7')
    expect(wrapper.text()).toContain('· 12 reseñas')
  })

  it('sin reseñas, la línea de rating no existe — nunca "0,0" ni vacía', () => {
    const wrapper = mountCard({ professional: professional({ ratingAverage: null, reviewCount: 0 }) })
    expect(wrapper.text()).not.toContain('0,0')
    expect(wrapper.text()).not.toContain('reseñas')
  })

  it('en modo vecina, la comuna queda en negrita', () => {
    const wrapper = mountCard({ professional: professional(), vecina: true })
    const comuna = wrapper.findAll('p').find(p => p.text() === 'Ñuñoa')
    expect(comuna?.classes()).toContain('font-bold')
  })

  it('sin precio, la línea de precio no existe', () => {
    const wrapper = mountCard({ professional: professional({ priceFrom: null }) })
    expect(wrapper.text()).not.toContain('Desde $')
  })

  it('con precio, muestra el precio formateado', () => {
    const wrapper = mountCard({ professional: professional({ priceFrom: 15000 }) })
    expect(wrapper.text()).toContain('Desde $15.000')
  })

  it('es un link al perfil del profesional', () => {
    const wrapper = mountCard({ professional: professional({ id: 'xyz-789' }) })
    expect(wrapper.find('a').attributes('href')).toBe('/profesionales/xyz-789')
  })
})
