<script setup lang="ts">
import type { SearchResultProfessional } from '~/types/search'

const props = defineProps<{
  professional: SearchResultProfessional
  vecina?: boolean
}>()

const memberSince = computed(() => formatMemberSince(props.professional.createdAt))
</script>

<template>
  <NuxtLink
    :to="`/profesionales/${professional.id}`"
    class="flex gap-3 rounded-2xl border border-datealo-surface bg-white p-3.5"
  >
    <div
      class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-[0.9375rem] font-extrabold text-white"
    >
      {{ initials(professional.displayName) }}
    </div>
    <div class="min-w-0 flex-1">
      <p class="truncate text-sm font-bold text-datealo-text">{{ professional.displayName }}</p>
      <!-- en negrita en modo vecina: el peso visual, no solo el texto, tiene que avisar que esta comuna
           no es la que se pidió — así el fallback nunca se lee como un resultado real de la exacta -->
      <p class="truncate text-xs" :class="vecina ? 'font-bold text-datealo-text' : 'text-datealo-muted'">
        {{ professional.comunaNombre }}
      </p>
      <p v-if="professional.priceFrom" class="mt-1 text-xs font-bold text-datealo-text">
        Desde ${{ formatPriceFrom(professional.priceFrom) }}
      </p>
      <p class="mt-0.5 text-[0.6875rem] text-datealo-muted">En Datealo desde {{ memberSince }}</p>
    </div>
  </NuxtLink>
</template>
