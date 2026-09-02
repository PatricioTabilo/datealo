import type { PublicReview } from './review'

export type Professional = {
  id: string
  displayName: string
  categoriaSlug: string
  comunaCodigo: string
  contact: string
  description: string | null
  priceFrom: number | null
  photoUrls: string[]
  avatarUrl: string | null
  active: boolean
}

export type ProfessionalField =
  | 'displayName'
  | 'categoriaSlug'
  | 'comunaCodigo'
  | 'contact'
  | 'description'
  | 'priceFrom'

// Lo que ve un buscador sin sesión (misión 05): categoría/comuna ya resueltas a su nombre, y desde
// cuándo existe el perfil — ninguna de las dos cosas está en Professional (la forma del propio dueño).
export type PublicProfessionalProfile = {
  id: string
  displayName: string
  categoriaNombre: string
  comunaNombre: string
  contact: string
  description: string | null
  priceFrom: number | null
  photoUrls: string[]
  avatarUrl: string | null
  createdAt: string
  reviews: PublicReview[]
  ratingAverage: number | null
  reviewCount: number
}
