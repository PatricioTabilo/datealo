<script setup lang="ts">
import type { PublicReview } from '~/types/review'

const props = defineProps<{
  professionalId: string
  displayName: string
  categoriaNombre: string
  reviews: PublicReview[]
}>()

const emit = defineEmits<{
  published: [review: PublicReview]
}>()

const { getToken, getMyReview } = useReviewToken(props.professionalId)
const sheet = useReviewSheet(props.professionalId)
const toast = useToast()

// El token y el borrador solo existen en el navegador — en SSR no hay forma de saberlo, así que arrancan
// en false y se corrigen apenas monta. El "pop-in" de la card es aceptable: es la misma personalización
// que cualquier dato que solo vive en localStorage.
const hasToken = ref(false)
const hasMyReview = ref(false)

onMounted(() => {
  hasToken.value = Boolean(getToken())
  hasMyReview.value = Boolean(getMyReview())
})

const cardHeading = computed(() => {
  if (hasMyReview.value) return 'Editar tu reseña'
  if (props.reviews.length === 0) return `Sé el primero en contarle a otros cómo te fue con ${props.displayName}`
  return `¿Cómo te fue con ${props.displayName}?`
})

const cardButtonLabel = computed(() => hasMyReview.value ? 'Editar tu reseña' : 'Dejar una reseña')

async function handleSubmit() {
  const published = await sheet.submit()
  if (!published) return

  hasMyReview.value = true
  emit('published', published)
  toast.add({ title: 'Reseña publicada', color: 'success' })
}
</script>

<template>
  <div v-if="reviews.length > 0 || hasToken">
    <h2 class="text-sm font-extrabold text-datealo-text">Reseñas</h2>

    <div
      v-if="hasToken"
      class="mt-3 rounded-2xl border-[1.5px] border-dashed border-datealo-surface bg-datealo-surface/40 p-4"
    >
      <p class="text-sm font-bold text-datealo-text">{{ cardHeading }}</p>
      <UButton class="mt-2.5 w-full justify-center" @click="sheet.open()">
        {{ cardButtonLabel }}
      </UButton>
    </div>

    <div class="mt-3 space-y-2.5">
      <ProfessionalPublicReviewCard v-for="review in reviews" :key="review.id" :review="review" />
    </div>

    <ProfessionalPublicReviewSheet
      :open="sheet.isOpen.value"
      :mode="sheet.mode.value"
      :display-name="displayName"
      :categoria-nombre="categoriaNombre"
      :rating="sheet.rating.value"
      :comment="sheet.comment.value"
      :name="sheet.name.value"
      :submitting="sheet.submitting.value"
      :error-message="sheet.errorMessage.value"
      @update:open="sheet.isOpen.value = $event"
      @update:rating="sheet.rating.value = $event"
      @update:comment="sheet.comment.value = $event"
      @update:name="sheet.name.value = $event"
      @submit="handleSubmit"
    />
  </div>
</template>
