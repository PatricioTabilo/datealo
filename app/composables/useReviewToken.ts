const STORAGE_KEY_PREFIX = 'datealo:review-token:'

// El token nace en el cliente, antes de cualquier request al servidor, y se guarda de inmediato en
// localStorage — nunca depende de una respuesta. Si localStorage no está disponible (SSR, modo privado
// estricto), igual devuelve un token usable para esta sola request, solo que no persiste para la próxima.
export function useReviewToken(professionalId: string) {
  function ensureToken(): string {
    const key = STORAGE_KEY_PREFIX + professionalId

    if (typeof window === 'undefined') return crypto.randomUUID()

    try {
      const existing = window.localStorage.getItem(key)
      if (existing) return existing

      const token = crypto.randomUUID()
      window.localStorage.setItem(key, token)
      return token
    } catch {
      return crypto.randomUUID()
    }
  }

  return { ensureToken }
}
