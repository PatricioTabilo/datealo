import { ref } from 'vue'
import type { PublicReview } from '~/types/review'

export type ReviewSheetMode = 'new' | 'editing'

// Publicar y reemplazar son la misma acción del lado del servidor (upsert) — acá solo cambia qué
// título y qué valores iniciales ve quien reseña, según si ya tenía un borrador guardado.
export function useReviewSheet(professionalId: string) {
  const { ensureToken, getMyReview, saveMyReview } = useReviewToken(professionalId)

  const isOpen = ref(false)
  const mode = ref<ReviewSheetMode>('new')
  const rating = ref(0)
  const comment = ref('')
  const name = ref('')
  const submitting = ref(false)
  const errorMessage = ref<string | null>(null)

  function open() {
    const draft = getMyReview()

    mode.value = draft ? 'editing' : 'new'
    rating.value = draft?.rating ?? 0
    comment.value = draft?.comment ?? ''
    name.value = draft?.name ?? ''
    errorMessage.value = null
    isOpen.value = true
  }

  // Cerrar (X o backdrop) nunca guarda nada, ni siquiera el rating ya marcado — es todo o nada.
  function close() {
    isOpen.value = false
  }

  async function submit(): Promise<PublicReview | null> {
    if (rating.value < 1) return null

    submitting.value = true
    errorMessage.value = null

    try {
      const { review } = await $fetch<{ review: PublicReview }>(
        `/api/professionals/${professionalId}/reviews`,
        {
          method: 'POST',
          body: {
            token: ensureToken(),
            rating: rating.value,
            comment: comment.value || undefined,
            name: name.value || undefined,
          },
        },
      )

      saveMyReview({ rating: rating.value, comment: comment.value, name: name.value })
      isOpen.value = false
      return review
    } catch {
      // El mismo mensaje genérico cubre una falla de red y un rechazo del servidor — nunca menciona el
      // token ni la verificación, para no darle a quien prueba el flujo una pista de cómo distinguir
      // un rechazo por falta de contacto real de cualquier otro error.
      errorMessage.value = 'No pudimos publicar tu reseña. Inténtalo de nuevo.'
      return null
    } finally {
      submitting.value = false
    }
  }

  return { isOpen, mode, rating, comment, name, submitting, errorMessage, open, close, submit }
}
