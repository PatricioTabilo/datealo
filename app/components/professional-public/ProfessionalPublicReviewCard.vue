<script setup lang="ts">
import { Check } from '@lucide/vue'
import type { PublicReview } from '~/types/review'

const props = defineProps<{
  review: PublicReview
}>()

const relativeDate = computed(() => formatRelativeDate(props.review.updatedAt))
</script>

<template>
  <div class="rounded-2xl border border-datealo-surface bg-white p-4">
    <div class="flex items-center justify-between gap-2">
      <span class="text-sm font-bold text-datealo-text">{{ review.name }}</span>
      <span
        class="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[0.6875rem] font-semibold text-emerald-700"
      >
        <Check class="h-2.5 w-2.5" />
        verificada por contacto
      </span>
    </div>

    <div class="mt-1 flex items-center gap-1">
      <ProfessionalPublicStarRating :model-value="review.rating" readonly />
      <span class="ml-1 text-[0.6875rem] text-datealo-muted">{{ relativeDate }}</span>
    </div>

    <p v-if="review.comment" class="mt-2 text-sm text-datealo-text">{{ review.comment }}</p>
  </div>
</template>
