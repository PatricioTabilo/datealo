<script setup lang="ts">
import type { PublicCategoria } from '~/types/professional'

defineProps<{
  categorias: PublicCategoria[]
}>()
</script>

<template>
  <div class="border-t border-datealo-surface pt-4">
    <p class="text-xs font-bold text-datealo-muted">También hace</p>
    <div class="divide-y divide-datealo-surface">
      <div
        v-for="categoria in categorias"
        :key="categoria.slug"
        class="flex items-center justify-between gap-3 py-2.5 text-sm text-datealo-text"
      >
        <span>{{ categoria.nombre }}</span>
        <span v-if="categoria.priceFrom" class="font-bold">Desde ${{ formatPriceFrom(categoria.priceFrom) }}</span>
      </div>
    </div>
  </div>
</template>
