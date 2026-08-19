<script setup lang="ts">
// Única implementación de UXF-001 (docs/missions/03-taxonomia-categorias-y-comunas/experiencia.md):
// los 6 modos del selector de catálogo. No sabe si trabaja con categorías o comunas — quien lo usa
// (CategoriaSelect, ComunaSelect) le pasa los datos y el copy. Nunca emite un valor que no esté en
// `items`, y no muestra ninguna opción hasta que se escribe la primera letra (estilo Mercado Libre),
// en vez de mostrar el catálogo completo al enfocar.
// ref/computed importados explícitos (no solo auto-import de Nuxt): así el componente se puede
// montar en un test con Vitest + Vue Test Utils plano, sin levantar un contexto de Nuxt completo.
import { computed, ref, watch } from 'vue'

export type CatalogOption = { value: string, label: string }

const props = defineProps<{
  items: CatalogOption[]
  pending: boolean
  error: boolean
  placeholder: string
  errorMessage: string
}>()

const emit = defineEmits<{ retry: [] }>()

const modelValue = defineModel<string | null>({ default: null })

const searchTerm = ref('')

// Sin distinguir mayúsculas ni tildes, como pide UXF-001 — "nunoa" tiene que encontrar "Ñuñoa".
function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}

function matchesSearch(item: CatalogOption) {
  if (!searchTerm.value) return true
  return normalize(item.label).includes(normalize(searchTerm.value))
}

// El array que se le pasa a UInputMenu es siempre el catálogo completo, sin recortar — nunca cambia
// de referencia ni de orden entre teclas. Probado en el browser: reasignar `items` a un subconjunto
// en cada tecla (con `ignoreFilter`) hacía que un click en la única opción visible seleccionara otra
// distinta — la que ocupaba esa misma posición en el catálogo original. Qué se ve filtrado y qué no
// se controla visualmente en el slot `#item` (v-show, no v-if — nunca se saca del array).
const isOpen = computed(() => searchTerm.value.length > 0)

const hasNoMatches = computed(
  () => isOpen.value && !props.pending && !props.error && !props.items.some(matchesSearch),
)

// Reka UI resetea el searchTerm al seleccionar por default (resetSearchTermOnSelect) — como `open`
// está controlado y depende de `searchTerm`, ese reset cerraba el dropdown a mitad del click y la
// selección se perdía. Se desactiva ese reset automático (ver template) y se hace acá, reactivo,
// después de que la selección ya se aplicó — nunca a mitad de un click.
watch(modelValue, () => {
  searchTerm.value = ''
})

// Al salir del campo sin seleccionar (ej. escribió algo que no matchea y hizo click afuera), el
// searchTerm queda con ese texto inválido — y como el label del valor elegido solo se resuelve
// cuando matchesSearch lo deja visible, el campo ya cerrado no podía mostrarlo. Se limpia acá
// también, no solo al seleccionar.
function handleBlur() {
  searchTerm.value = ''
}

// Selección 100% propia — nunca se confía en que UInputMenu resuelva qué se clickeó.
function selectItem(item: CatalogOption) {
  modelValue.value = item.value
}
</script>

<template>
  <UInputMenu
    :model-value="modelValue ?? undefined"
    v-model:search-term="searchTerm"
    :open="isOpen"
    :items="props.items"
    :loading="pending"
    :disabled="error"
    value-key="value"
    label-key="label"
    ignore-filter
    :create-item="false"
    :reset-search-term-on-select="false"
    :placeholder="placeholder"
    @blur="handleBlur"
  >
    <template #item="{ item }">
      <div
        v-show="matchesSearch(item)"
        class="flex w-full cursor-pointer items-center rounded-md px-2 py-1.5 text-sm hover:bg-elevated"
        :data-testid="`option-${item.value}`"
        @click.stop.prevent="selectItem(item)"
      >
        {{ item.label }}
      </div>
    </template>
    <template #content-bottom>
      <div v-if="error" class="flex flex-col items-center gap-2 px-2 py-2 text-center">
        <p class="text-sm text-muted">{{ errorMessage }}</p>
        <UButton size="sm" data-testid="retry-button" @click="emit('retry')">Reintentar</UButton>
      </div>
      <p v-else-if="hasNoMatches" class="px-2 py-2 text-sm text-muted">
        No encontramos "{{ searchTerm }}"
      </p>
    </template>
  </UInputMenu>
</template>
