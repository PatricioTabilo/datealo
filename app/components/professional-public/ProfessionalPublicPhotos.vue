<script setup lang="ts">
defineProps<{
  photoUrls: string[]
  displayName: string
}>()

function initials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map(part => part[0]?.toUpperCase() ?? '').join('')
}
</script>

<template>
  <UCarousel v-if="photoUrls.length" :items="photoUrls" dots class="aspect-4/3 w-full overflow-hidden">
    <template #default="{ item, index }">
      <img
        :src="item"
        :alt="`Foto de trabajo de ${displayName}, ${index + 1} de ${photoUrls.length}`"
        class="h-full w-full object-cover"
      >
    </template>
  </UCarousel>

  <div v-else class="flex aspect-4/3 w-full items-center justify-center bg-datealo-surface">
    <div class="flex h-22 w-22 items-center justify-center rounded-full bg-primary text-2xl font-extrabold text-white">
      {{ initials(displayName) }}
    </div>
  </div>
</template>
