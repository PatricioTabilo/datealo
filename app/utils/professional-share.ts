import type { PublicProfessionalProfile } from '~/types/professional'
import { formatPriceFrom } from './professional-price'
import { formatRating } from './professional-reviews'

// WhatsApp y las demás apps cortan el título de la vista previa en una o dos líneas, así que desde la
// tercera comuna se resume en vez de listarlas todas.
export function formatShareComunas(nombres: string[]): string {
  if (nombres.length <= 2) return nombres.join(' y ')
  return `${nombres[0]} y ${nombres.length - 1} comunas más`
}

export function buildProfessionalShareTitle(displayName: string, categoriaNombre: string, comunaNombres: string[]): string {
  return `${displayName} · ${categoriaNombre} en ${formatShareComunas(comunaNombres)}`
}

export function buildProfessionalShareDescription(
  professional: Pick<PublicProfessionalProfile, 'ratingAverage' | 'reviewCount' | 'photoUrls'>,
  priceFrom: number | null,
): string {
  const parts: string[] = []
  if (professional.ratingAverage !== null && professional.reviewCount > 0) {
    const label = professional.reviewCount === 1 ? 'reseña' : 'reseñas'
    parts.push(`★ ${formatRating(professional.ratingAverage)} (${professional.reviewCount} ${label})`)
  }
  if (priceFrom) parts.push(`Desde $${formatPriceFrom(priceFrom)}`)
  parts.push(professional.photoUrls.length > 0
    ? 'Mira sus trabajos y contacta directo en Datealo.'
    : 'Mira su perfil y contacta directo en Datealo.')
  return parts.join(' · ')
}

// null deja la imagen de marca que app.vue pone por defecto en todas las páginas.
export function pickProfessionalShareImage(professional: Pick<PublicProfessionalProfile, 'photoUrls' | 'avatarUrl'>): string | null {
  return professional.photoUrls[0] ?? professional.avatarUrl
}
