<script setup lang="ts">
import { ChevronLeft } from '@lucide/vue'

const route = useRoute()
const isBuscar = computed(() => route.path === '/buscar')
const lastSearchQuery = useLastSearchQuery()

// En /buscar, volver es un nivel más arriba (la landing). En el perfil, vuelve a /buscar con la
// categoría/comuna que trajo hasta acá — nunca router.back(), no hay historial si se entró por un link
// externo (ej. WhatsApp).
const backTo = computed(() => {
  if (isBuscar.value) return '/'
  const query: Record<string, string> = {}
  if (lastSearchQuery.value.categoria) query.categoria = lastSearchQuery.value.categoria
  if (lastSearchQuery.value.comuna) query.comuna = lastSearchQuery.value.comuna
  return { path: '/buscar', query }
})
const backLabel = computed(() => (isBuscar.value ? 'Volver al inicio' : 'Volver a la búsqueda'))

// Solo en desktop: /buscar y el perfil público no tienen la restricción de espacio que en mobile justifica
// "volver" en vez del logo — ahí el logo reemplaza al botón. /profesional/* (edición de la cuenta propia,
// no contenido público) mantiene "volver" en los dos tamaños.
const showLogoInDesktop = computed(() => isBuscar.value || route.path.startsWith('/profesionales/'))

const { professional } = await useProfessionalSession()
</script>

<template>
  <header class="sticky top-0 z-20 border-b border-datealo-surface bg-white">
    <div class="flex items-center gap-3 px-5 py-3.5 lg:hidden">
      <NuxtLink
        :to="backTo"
        :aria-label="backLabel"
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-datealo-text"
      >
        <ChevronLeft class="h-5 w-5" />
      </NuxtLink>
      <CompactSearchBar v-if="isBuscar" class="min-w-0 flex-1" />
      <NuxtLink
        v-if="professional"
        to="/profesional/perfil"
        aria-label="Mi perfil"
        class="ml-auto flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-xs font-extrabold text-white"
      >
        <img v-if="professional.avatarUrl" :src="professional.avatarUrl" alt="" class="h-full w-full object-cover">
        <span v-else>{{ initials(professional.displayName) }}</span>
      </NuxtLink>
    </div>

    <div class="hidden grid-cols-[1fr_auto_1fr] items-center gap-6 px-12 py-4 lg:grid">
      <NuxtLink
        v-if="showLogoInDesktop"
        to="/"
        class="w-fit justify-self-start font-heading text-lg font-extrabold text-primary"
      >
        datea<span class="text-secondary">lo</span>
      </NuxtLink>
      <NuxtLink
        v-else
        :to="backTo"
        :aria-label="backLabel"
        class="flex w-fit items-center gap-2 justify-self-start rounded-full px-3.5 py-2 text-sm font-bold text-datealo-text hover:bg-datealo-surface"
      >
        <ChevronLeft class="h-5 w-5" />
        Volver
      </NuxtLink>

      <CompactSearchBar v-if="isBuscar" dense />
      <span v-else />

      <NuxtLink
        v-if="professional"
        to="/profesional/perfil"
        aria-label="Mi perfil"
        class="flex h-10 w-10 shrink-0 items-center justify-center justify-self-end overflow-hidden rounded-full bg-primary text-sm font-extrabold text-white"
      >
        <img v-if="professional.avatarUrl" :src="professional.avatarUrl" alt="" class="h-full w-full object-cover">
        <span v-else>{{ initials(professional.displayName) }}</span>
      </NuxtLink>
      <span v-else />
    </div>
  </header>
</template>
