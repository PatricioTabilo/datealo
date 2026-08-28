export type Professional = {
  id: string
  displayName: string
  categoriaSlug: string
  comunaCodigo: string
  contact: string
  description: string | null
  priceFrom: number | null
  photoUrls: string[]
  active: boolean
}

export type ProfessionalField =
  | 'displayName'
  | 'categoriaSlug'
  | 'comunaCodigo'
  | 'contact'
  | 'description'
  | 'priceFrom'
