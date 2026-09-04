export type SearchMatchType = 'exacta' | 'vecina' | 'ninguna'

export type SearchResultProfessional = {
  id: string
  displayName: string
  comunaNombre: string
  priceFrom: number | null
  avatarUrl: string | null
  photoUrl: string | null
  ratingAverage: number | null
  reviewCount: number
  createdAt: string
}

export type SearchApiResponse = {
  results: SearchResultProfessional[]
  matchType: SearchMatchType
  categoryHasResultsInChile: boolean
}
