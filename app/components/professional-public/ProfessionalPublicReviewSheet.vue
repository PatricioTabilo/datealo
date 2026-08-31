<script setup lang="ts">
const props = defineProps<{
  open: boolean
  mode: 'new' | 'editing'
  displayName: string
  categoriaNombre: string
  rating: number
  comment: string
  name: string
  submitting: boolean
  errorMessage: string | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'update:rating': [value: number]
  'update:comment': [value: string]
  'update:name': [value: string]
  submit: []
}>()

const title = computed(() => props.mode === 'editing' ? 'Editar tu reseña' : 'Dejar una reseña')
const commentCount = computed(() => [...props.comment].length)
</script>

<template>
  <USlideover
    :open="open"
    side="bottom"
    :title="title"
    :description="`Para ${displayName} · ${categoriaNombre}`"
    @update:open="emit('update:open', $event)"
  >
    <template #body>
      <div>
        <p class="text-sm font-bold text-datealo-text">¿Cómo calificarías a {{ displayName }}?</p>
        <ProfessionalPublicStarRating
          class="mt-2"
          size="lg"
          :model-value="rating"
          @update:model-value="emit('update:rating', $event)"
        />

        <label class="mt-4 block text-sm font-bold text-datealo-text" for="review-comment">
          Cuéntale a otros cómo te fue (opcional)
        </label>
        <UTextarea
          id="review-comment"
          class="mt-1.5 w-full"
          :rows="3"
          :model-value="comment"
          placeholder="Ej: fue simpático, explicó bien el problema y no dejó ningún cable pelado"
          @update:model-value="emit('update:comment', String($event))"
        />
        <p class="mt-1 text-right text-[0.6875rem] text-datealo-muted">{{ commentCount }}/500</p>

        <label class="mt-2 block text-sm font-bold text-datealo-text" for="review-name">
          Tu nombre (opcional)
        </label>
        <UInput
          id="review-name"
          class="mt-1.5 w-full"
          :model-value="name"
          placeholder="Ej: Carmen"
          @update:model-value="emit('update:name', String($event))"
        />
        <p class="mt-1 text-[0.6875rem] text-datealo-muted">
          Si lo dejas en blanco, aparecerás como "un cliente de Datealo"
        </p>

        <p v-if="errorMessage" class="mt-3 text-center text-[0.8125rem] font-medium text-red-600" aria-live="polite">
          {{ errorMessage }}
        </p>

        <UButton
          class="mt-4 w-full justify-center"
          size="xl"
          :disabled="rating < 1"
          :loading="submitting"
          @click="emit('submit')"
        >
          Publicar reseña
        </UButton>
      </div>
    </template>
  </USlideover>
</template>
