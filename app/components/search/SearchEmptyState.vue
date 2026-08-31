<script setup lang="ts">
import { Search } from '@lucide/vue'

defineProps<{ title: string, subtitle: string }>()
</script>

<template>
  <div class="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
    <Search class="h-10 w-10 text-datealo-muted" />
    <h1 class="mt-2 text-base font-extrabold text-datealo-text">{{ title }}</h1>
    <p class="text-sm text-datealo-muted">{{ subtitle }}</p>
  </div>
</template>
