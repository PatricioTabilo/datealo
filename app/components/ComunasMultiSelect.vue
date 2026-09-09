<script setup lang="ts">
// UDrawer (vaul-vue), no el combobox multiple de Nuxt UI: UInputMenu/USelectMenu comparten los mismos
// primitivos de Reka UI que ya fallaron en pruebas reales de browser para CatalogSelect (ver su propio
// comentario) — acá el filtro es manual, sin combobox, igual que ahí.
import { Check, Search } from '@lucide/vue'

const props = defineProps<{
  open: boolean
  // Comunas ya confirmadas — el sheet arranca cada apertura con exactamente estas marcadas.
  selected: string[]
}>()

const emit = defineEmits<{
  'update:open': [boolean]
  confirm: [string[]]
}>()

const { items, pending, error, refresh } = useComunasCatalog()

const draft = ref<string[]>([])
const searchTerm = ref('')

// Reinicia el borrador con cada apertura — así cerrar sin tocar "Listo" nunca deja un resto de la
// sesión anterior (marcas a medio hacer, un término de búsqueda) filtrando la próxima vez. immediate:
// true además de la transición false→true, porque el consumidor puede montar el componente con open ya
// en true (ej. abierto por un query param) — sin esto, ese caso arrancaría con el borrador vacío.
watch(() => props.open, (isOpen) => {
  if (!isOpen) return
  draft.value = [...props.selected]
  searchTerm.value = ''
}, { immediate: true })

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}

const visibleItems = computed(() => {
  if (!searchTerm.value) return items.value
  const term = normalize(searchTerm.value)
  return items.value.filter(item => normalize(item.label).includes(term))
})

const hasNoMatches = computed(() => !pending.value && !error.value && searchTerm.value !== '' && visibleItems.value.length === 0)

function isSelected(codigo: string) {
  return draft.value.includes(codigo)
}

// El filtro nunca desmarca nada: toggle actúa siempre sobre draft completo, sin importar qué esté
// visible bajo el término de búsqueda actual.
function toggle(codigo: string) {
  draft.value = isSelected(codigo) ? draft.value.filter(c => c !== codigo) : [...draft.value, codigo]
}

const canConfirm = computed(() => draft.value.length > 0)

const countLabel = computed(() => draft.value.length === 1 ? '1 comuna marcada' : `${draft.value.length} comunas marcadas`)

function confirm() {
  if (!canConfirm.value) return
  emit('confirm', draft.value)
  emit('update:open', false)
}
</script>

<template>
  <UDrawer :open="open" title="Tus comunas" :close="true" @update:open="emit('update:open', $event)">
    <template #body>
      <div class="px-4 pt-1">
        <div class="flex items-center gap-2 rounded-xl bg-datealo-surface px-3 py-2.5">
          <Search class="h-4 w-4 shrink-0 text-datealo-muted" />
          <input
            v-model="searchTerm"
            type="text"
            placeholder="¿Qué comuna buscas?"
            class="w-full bg-transparent text-sm text-datealo-text placeholder:text-datealo-muted focus:outline-none"
          >
        </div>
      </div>

      <div class="mt-2 max-h-[50vh] overflow-auto">
        <div v-if="error" class="flex flex-col items-center gap-3 px-6 py-8 text-center">
          <p class="text-sm text-datealo-muted">No pudimos cargar las comunas.</p>
          <UButton size="lg" @click="refresh()">Reintentar</UButton>
        </div>

        <div v-else-if="pending" class="space-y-3 px-5 py-6" aria-busy="true">
          <div class="h-3 w-3/4 animate-pulse rounded bg-datealo-surface" />
          <div class="h-3 w-1/2 animate-pulse rounded bg-datealo-surface" />
          <div class="h-3 w-2/3 animate-pulse rounded bg-datealo-surface" />
        </div>

        <p v-else-if="hasNoMatches" class="px-6 py-8 text-center text-sm text-datealo-muted">
          No encontramos "{{ searchTerm }}"
        </p>

        <template v-else>
          <button
            v-for="item in visibleItems"
            :key="item.value"
            type="button"
            role="checkbox"
            :aria-checked="isSelected(item.value)"
            class="flex min-h-11 w-full items-center gap-3 px-4 text-left"
            @click="toggle(item.value)"
          >
            <span
              class="flex h-5 w-5 shrink-0 items-center justify-center rounded-[0.375rem] border-[1.5px]"
              :class="isSelected(item.value) ? 'border-primary bg-primary text-white' : 'border-accented'"
            >
              <Check v-if="isSelected(item.value)" class="h-3.5 w-3.5" />
            </span>
            <span class="text-sm" :class="isSelected(item.value) ? 'font-semibold text-datealo-text' : 'text-datealo-text'">
              {{ item.label }}
            </span>
          </button>
        </template>
      </div>
    </template>

    <template v-if="!pending && !error" #footer>
      <div class="flex items-center justify-between gap-3 border-t border-datealo-surface px-4 pt-3">
        <p aria-live="polite" class="text-sm" :class="canConfirm ? 'text-datealo-muted' : 'font-semibold text-error'">
          {{ canConfirm ? countLabel : 'Marca al menos una comuna' }}
        </p>
        <UButton :disabled="!canConfirm" size="lg" class="min-h-11" @click="confirm">Listo</UButton>
      </div>
    </template>
  </UDrawer>
</template>
