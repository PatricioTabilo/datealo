<script setup lang="ts">
import { Star } from '@lucide/vue'
import { computed } from 'vue'
import type { SearchResultProfessional } from '~/types/search'
import { initials } from '../../utils/professional-initials'
import { formatPriceFrom } from '../../utils/professional-price'
import { formatMemberSince } from '../../utils/professional-since'

const props = defineProps<{
  professional: SearchResultProfessional
  vecina?: boolean
}>()

const memberSince = computed(() => formatMemberSince(props.professional.createdAt))
</script>

<template>
  <NuxtLink
    :to="`/profesionales/${professional.id}`"
    class="flex flex-col overflow-hidden rounded-2xl border border-datealo-surface bg-white transition-shadow duration-200 hover:shadow-[0_8px_24px_-12px_rgba(31,41,55,0.25)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
  >
    <img
      v-if="professional.photoUrl"
      :src="professional.photoUrl"
      :alt="`Foto de trabajo de ${professional.displayName}`"
      class="aspect-4/3 w-full object-cover"
    >
    <!-- No reusa ProfessionalPublicPhotos.vue: ese componente trae UCarousel y miniaturas para varias
         fotos, algo que esta card nunca necesita — siempre muestra una sola, sin interacción. -->
    <div v-else class="flex aspect-4/3 w-full items-center justify-center bg-primary/10">
      <img
        v-if="professional.avatarUrl"
        :src="professional.avatarUrl"
        :alt="professional.displayName"
        class="h-22 w-22 rounded-full object-cover"
      >
      <div v-else class="flex h-22 w-22 items-center justify-center rounded-full bg-primary text-2xl font-extrabold text-white">
        {{ initials(professional.displayName) }}
      </div>
    </div>

    <div class="min-w-0 p-3.5">
      <p class="truncate text-sm font-bold text-datealo-text">{{ professional.displayName }}</p>
      <!-- en negrita en modo vecina: el peso visual, no solo el texto, tiene que avisar que esta comuna
           no es la que se pidió — así el fallback nunca se lee como un resultado real de la exacta -->
      <p class="truncate text-xs" :class="vecina ? 'font-bold text-datealo-text' : 'text-datealo-muted'">
        {{ professional.comunaNombre }}
      </p>
      <div v-if="professional.ratingAverage !== null" class="mt-1 flex items-center gap-1 text-xs">
        <Star class="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
        <span class="font-bold text-datealo-text">{{ professional.ratingAverage.toFixed(1).replace('.', ',') }}</span>
        <span class="text-datealo-muted">· {{ professional.reviewCount }} reseñas</span>
      </div>
      <p v-if="professional.priceFrom" class="mt-1 text-xs font-bold text-datealo-text">
        Desde ${{ formatPriceFrom(professional.priceFrom) }}
      </p>
      <p class="mt-0.5 text-[0.6875rem] text-datealo-muted">En Datealo desde {{ memberSince }}</p>
    </div>
  </NuxtLink>
</template>
