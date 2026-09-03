<script setup lang="ts">
import { ChevronLeft } from '@lucide/vue'

defineProps<{
  title: string
}>()

const router = useRouter()
</script>

<template>
  <div class="flex items-center gap-3 border-b border-datealo-surface px-5 py-4 lg:gap-4 lg:px-12 lg:py-6">
    <button
      type="button"
      aria-label="Volver"
      class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-datealo-text lg:hidden"
      @click="router.back()"
    >
      <ChevronLeft class="h-5 w-5" />
    </button>
    <NuxtLink to="/" class="hidden font-heading text-lg font-extrabold text-primary lg:inline">
      datea<span class="text-secondary">lo</span>
    </NuxtLink>
    <span class="hidden text-datealo-muted lg:inline">/</span>
    <p class="font-heading font-extrabold text-datealo-text">{{ title }}</p>
  </div>
</template>
