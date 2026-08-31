const STORAGE_KEY_PREFIX = 'datealo:review-token:'
const MY_REVIEW_KEY_PREFIX = 'datealo:my-review:'

export type MyReviewDraft = {
  rating: number
  comment: string
  name: string
}

// El token nace en el cliente, antes de cualquier request al servidor, y se guarda de inmediato en
// localStorage — nunca depende de una respuesta. Si localStorage no está disponible (SSR, modo privado
// estricto), igual devuelve un token usable para esta sola request, solo que no persiste para la próxima.
export function useReviewToken(professionalId: string) {
  const tokenKey = STORAGE_KEY_PREFIX + professionalId
  const myReviewKey = MY_REVIEW_KEY_PREFIX + professionalId

  function ensureToken(): string {
    if (typeof window === 'undefined') return crypto.randomUUID()

    try {
      const existing = window.localStorage.getItem(tokenKey)
      if (existing) return existing

      const token = crypto.randomUUID()
      window.localStorage.setItem(tokenKey, token)
      return token
    } catch {
      return crypto.randomUUID()
    }
  }

  // Nunca genera un token — a diferencia de ensureToken, esto solo pregunta "¿este navegador ya
  // contactó?" para decidir si mostrar la opción de reseñar (UX-001). Generar uno acá inventaría un
  // token sin que haya ocurrido ningún contacto real.
  function getToken(): string | null {
    if (typeof window === 'undefined') return null

    try {
      return window.localStorage.getItem(tokenKey)
    } catch {
      return null
    }
  }

  // La única forma de saber qué escribió este navegador la última vez, para prellenar el sheet al
  // editar (CL-003) — el servidor nunca devuelve el token asociado a una reseña, así que no hay ningún
  // endpoint del que leerlo de vuelta.
  function getMyReview(): MyReviewDraft | null {
    if (typeof window === 'undefined') return null

    try {
      const raw = window.localStorage.getItem(myReviewKey)
      return raw ? JSON.parse(raw) as MyReviewDraft : null
    } catch {
      return null
    }
  }

  function saveMyReview(review: MyReviewDraft) {
    if (typeof window === 'undefined') return

    try {
      window.localStorage.setItem(myReviewKey, JSON.stringify(review))
    } catch {
      // La reseña ya se publicó en el servidor — perder este borrador local solo significa que el
      // próximo "Editar tu reseña" no prellena, no que la reseña se haya perdido.
    }
  }

  return { ensureToken, getToken, getMyReview, saveMyReview }
}
