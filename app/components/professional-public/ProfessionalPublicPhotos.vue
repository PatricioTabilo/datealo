<script setup lang="ts">
defineProps<{
  photoUrls: string[]
  displayName: string
  avatarUrl: string | null
}>()

// La tira de miniaturas es solo un atajo de navegación sobre el mismo carrusel — activeIndex refleja
// el slide actual (evento select de UCarousel) para resaltar cuál mira el visitante, y clickear una
// miniatura mueve ese mismo carrusel en vez de duplicar su estado.
const carousel = useTemplateRef('carousel')
const activeIndex = ref(0)

function selectPhoto(index: number) {
  carousel.value?.emblaApi?.scrollTo(index)
}
</script>

<template>
  <div v-if="photoUrls.length">
    <UCarousel
      ref="carousel"
      :items="photoUrls"
      dots
      class="aspect-4/3 w-full overflow-hidden lg:rounded-2xl"
      @select="activeIndex = $event"
    >
      <template #default="{ item, index }">
        <img
          :src="item"
          :alt="`Foto de trabajo de ${displayName}, ${index + 1} de ${photoUrls.length}`"
          class="h-full w-full object-cover"
        >
      </template>
    </UCarousel>

    <div v-if="photoUrls.length > 1" class="mt-2 hidden gap-2 lg:flex">
      <button
        v-for="(url, index) in photoUrls"
        :key="url"
        type="button"
        class="aspect-square w-16 overflow-hidden rounded-lg ring-2 ring-offset-2"
        :class="index === activeIndex ? 'ring-primary' : 'ring-transparent'"
        :aria-label="`Ver foto ${index + 1} de ${photoUrls.length}`"
        :aria-current="index === activeIndex"
        @click="selectPhoto(index)"
      >
        <!-- alt vacío a propósito: el aria-label del botón ya es el nombre accesible completo de este
             control (qué foto activa y su posición) — un lector de pantalla nunca anuncia el alt de la
             imagen interna por separado, así que dejarlo con texto solo agrega algo que nadie escucha. -->
        <img :src="url" alt="" class="h-full w-full object-cover">
      </button>
    </div>
  </div>

  <div v-else class="flex aspect-4/3 w-full items-center justify-center bg-datealo-surface lg:rounded-2xl">
    <img v-if="avatarUrl" :src="avatarUrl" :alt="displayName" class="h-22 w-22 rounded-full object-cover">
    <div v-else class="flex h-22 w-22 items-center justify-center rounded-full bg-primary text-2xl font-extrabold text-white">
      {{ initials(displayName) }}
    </div>
  </div>
</template>
