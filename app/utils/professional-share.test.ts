import { describe, expect, it } from 'vitest'
import {
  buildProfessionalShareDescription,
  buildProfessionalShareTitle,
  formatShareComunas,
  pickProfessionalShareImage,
} from './professional-share'

describe('formatShareComunas', () => {
  it('lista una o dos comunas completas', () => {
    expect(formatShareComunas(['Ñuñoa'])).toBe('Ñuñoa')
    expect(formatShareComunas(['Cerrillos', 'Maipú'])).toBe('Cerrillos y Maipú')
  })

  it('desde la tercera comuna resume con el total restante', () => {
    expect(formatShareComunas(['Frutillar', 'Llanquihue', 'Puerto Montt', 'Puerto Varas']))
      .toBe('Frutillar y 3 comunas más')
  })
})

describe('buildProfessionalShareTitle', () => {
  it('une nombre, categoría y comunas', () => {
    expect(buildProfessionalShareTitle('Carmen Rojas', 'Peluquería', ['Ñuñoa']))
      .toBe('Carmen Rojas · Peluquería en Ñuñoa')
  })
})

describe('buildProfessionalShareDescription', () => {
  const base = { ratingAverage: null, reviewCount: 0, photoUrls: [] }

  it('con reseñas, precio y fotos muestra las tres cosas', () => {
    const description = buildProfessionalShareDescription(
      { ratingAverage: 5, reviewCount: 1, photoUrls: ['https://x/1.jpg'] },
      15000,
    )
    expect(description).toBe('★ 5,0 (1 reseña) · Desde $15.000 · Mira sus trabajos y contacta directo en Datealo.')
  })

  it('pluraliza las reseñas', () => {
    expect(buildProfessionalShareDescription({ ...base, ratingAverage: 4.7, reviewCount: 12 }, null))
      .toBe('★ 4,7 (12 reseñas) · Mira su perfil y contacta directo en Datealo.')
  })

  it('sin reseñas ni precio queda solo la invitación', () => {
    expect(buildProfessionalShareDescription(base, null)).toBe('Mira su perfil y contacta directo en Datealo.')
  })
})

describe('pickProfessionalShareImage', () => {
  it('prefiere la primera foto de trabajos', () => {
    expect(pickProfessionalShareImage({ photoUrls: ['a.jpg', 'b.jpg'], avatarUrl: 'avatar.jpg' })).toBe('a.jpg')
  })

  it('sin fotos de trabajos usa la foto de perfil', () => {
    expect(pickProfessionalShareImage({ photoUrls: [], avatarUrl: 'avatar.jpg' })).toBe('avatar.jpg')
  })

  it('sin ninguna foto devuelve null para que quede la imagen de marca', () => {
    expect(pickProfessionalShareImage({ photoUrls: [], avatarUrl: null })).toBeNull()
  })
})
