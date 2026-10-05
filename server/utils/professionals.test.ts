import { describe, expect, it } from 'vitest'
import { buildProfessionalWelcomeEmail } from './professionals'

describe('buildProfessionalWelcomeEmail', () => {
  const base = {
    displayName: 'Héctor Muñoz',
    categoriaNombre: 'Electricidad',
    comunaNombre: 'Ñuñoa',
    profileUrl: 'https://datealo.cl/profesional/perfil',
  }

  it('saluda por el primer nombre y nombra categoría y comuna', () => {
    const { subject, html } = buildProfessionalWelcomeEmail(base)

    expect(subject).toBe('Tu perfil ya está publicado en Datealo')
    expect(html).toContain('Héctor, tu perfil ya está publicado')
    expect(html).toContain('<strong>Electricidad</strong> en <strong>Ñuñoa</strong>')
  })

  it('el botón lleva al perfil propio', () => {
    const { html } = buildProfessionalWelcomeEmail(base)
    expect(html).toContain('href="https://datealo.cl/profesional/perfil"')
    expect(html).toContain('Completar mi perfil')
  })

  it('escapa HTML en nombre, categoría y comuna', () => {
    const { html } = buildProfessionalWelcomeEmail({
      ...base,
      displayName: '<b>Héctor</b>',
      categoriaNombre: '<i>Gas</i>',
      comunaNombre: '<script>x</script>',
    })
    expect(html).not.toContain('<b>Héctor</b>')
    expect(html).not.toContain('<i>Gas</i>')
    expect(html).not.toContain('<script>x</script>')
  })
})
