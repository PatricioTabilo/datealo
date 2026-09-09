import type { PublicReview } from './review'

export type PublicCategoria = {
  slug: string
  nombre: string
  priceFrom: number | null
  description: string | null
}

export type Professional = {
  id: string
  displayName: string
  comunaCodigo: string
  contact: string
  categorias: PublicCategoria[]
  photoUrls: string[]
  avatarUrl: string | null
  active: boolean
}

export type ProfessionalField =
  | 'displayName'
  | 'comunaCodigo'
  | 'contact'

// Lo que ve un buscador sin sesión (misión 05): categoría/comuna ya resueltas a su nombre, y desde
// cuándo existe el perfil — ninguna de las dos cosas está en Professional (la forma del propio dueño).
export type PublicProfessionalProfile = {
  id: string
  displayName: string
  comunaNombre: string
  contact: string
  categorias: PublicCategoria[]
  photoUrls: string[]
  avatarUrl: string | null
  createdAt: string
  reviews: PublicReview[]
  ratingAverage: number | null
  reviewCount: number
}
