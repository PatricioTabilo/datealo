<script setup lang="ts">
import { MapPin, Wrench } from '@lucide/vue'
import type { CompactSearchField } from '~/composables/useCompactSearch'
import { CATEGORIA_ICONS } from '~/constants/categoria-icons'

defineProps<{
  activeField: CompactSearchField
}>()

const emit = defineEmits<{
  'select-categoria': [slug: string]
  'select-comuna': [codigo: string]
}>()

const { items: categoriaItems } = useCategoriasCatalog()
const { items: comunaItems } = useComunasCatalog()
const { items: frecuentesItems } = useComunasFrecuentes()

const comunaSearch = ref('')

function normalize(value: string) {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
}

const comunaResults = computed(() => {
  const term = comunaSearch.value.trim()
  if (!term) return frecuentesItems.value
  return comunaItems.value.filter(item => normalize(item.label).includes(normalize(term)))
})

function iconFor(slug: string) {
  return CATEGORIA_ICONS[slug as keyof typeof CATEGORIA_ICONS] ?? Wrench
}
</script>

<template>
  <div>
    <template v-if="activeField === 'categoria'">
      <p class="px-1 pb-1 text-[0.6875rem] font-bold uppercase tracking-wide text-datealo-muted">Categorías</p>
      <div class="divide-y divide-datealo-surface rounded-2xl border border-datealo-surface">
        <button
          v-for="item in categoriaItems"
          :key="item.value"
          type="button"
          class="flex w-full items-center gap-3 rounded-lg px-4 py-3.5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
          @click="emit('select-categoria', item.value)"
        >
          <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-datealo-surface text-primary">
            <component :is="iconFor(item.value)" class="h-4 w-4" />
          </span>
          <span class="text-sm font-semibold text-datealo-text">{{ item.label }}</span>
        </button>
      </div>
    </template>

    <template v-else>
      <UInput v-model="comunaSearch" placeholder="Escribe tu comuna…" size="lg" class="mb-3 w-full" />
      <p class="px-1 pb-1 text-[0.6875rem] font-bold uppercase tracking-wide text-datealo-muted">
        {{ comunaSearch.trim() ? 'Resultados' : 'Comunas frecuentes' }}
      </p>
      <div class="divide-y divide-datealo-surface rounded-2xl border border-datealo-surface">
        <button
          v-for="item in comunaResults"
          :key="item.value"
          type="button"
          class="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
          @click="emit('select-comuna', item.value)"
        >
          <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-datealo-surface text-primary">
            <MapPin class="h-4 w-4" />
          </span>
          <span class="text-sm font-semibold text-datealo-text">{{ item.label }}</span>
        </button>
        <p v-if="!comunaResults.length" class="px-4 py-3 text-sm text-datealo-muted">
          No encontramos "{{ comunaSearch }}"
        </p>
      </div>
    </template>
  </div>
</template>
