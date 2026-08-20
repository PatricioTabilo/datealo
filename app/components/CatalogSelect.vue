<script setup lang="ts">
// Única implementación de los 6 modos del selector de catálogo (cerrado, enfocado sin texto, con
// coincidencias, sin coincidencias, cargando, error). No sabe si trabaja con categorías o comunas —
// quien lo usa (CategoriaSelect, ComunaSelect) le pasa los datos, el copy y `showAllOnFocus`. Nunca
// emite un valor que no esté en `items`.
//
// No usa el modo combobox de UInputMenu: probado en un browser real, la combinación de items
// controlados + selección interna de Reka UI no resolvía de forma confiable qué opción se había
// clickeado, y a veces no abría la lista en absoluto. Es un `UInput` simple (input de texto, sin
// comportamiento propio de combobox) más una lista propia debajo — selección, filtrado y apertura
// 100% manejados acá, sin depender de que una librería de combobox adivine la intención correcta.
//
// ref/computed importados explícitos (no solo auto-import de Nuxt): así el componente se puede montar
// en un test con Vitest + Vue Test Utils plano, sin levantar un contexto de Nuxt completo.
import { computed, ref, watch } from 'vue'

export type CatalogOption = { value: string, label: string }

const props = defineProps<{
  items: CatalogOption[]
  pending: boolean
  error: boolean
  placeholder: string
  errorMessage: string
  // Catálogo chico (categorías): mostrar todo al enfocar no cuesta nada. Catálogo grande (comunas):
  // esperar a que se escriba, el patrón ya validado de Mercado Libre — mostrar todas las opciones de
  // entrada es más ruido que ayuda.
  showAllOnFocus?: boolean
}>()

const emit = defineEmits<{ retry: [] }>()

const modelValue = defineModel<string | null>({ default: null })

const containerRef = ref<HTMLElement | null>(null)
// UInput expone su <input> nativo como `inputRef` (node_modules/@nuxt/ui/dist/runtime/components/Input.vue)
const uInputRef = ref<{ inputRef?: HTMLInputElement | null } | null>(null)

const selectedLabel = computed(() => props.items.find(item => item.value === modelValue.value)?.label ?? null)

// El texto que se ve en el campo, y la única fuente de verdad de lo que dice el input. Al elegir una
// opción pasa a ser su label, así que el campo se comporta como un input de texto común y corriente: el
// cursor cae donde se hace click, lo escrito se inserta ahí, y nada se autoselecciona ni se borra solo.
// Es exactamente lo que hace el selector de comuna de Mercado Libre (verificado sobre el sitio real).
const searchTerm = ref(selectedLabel.value ?? '')

const focused = ref(false)
// Distingue "enfocado pero sin tocar nada" de "está buscando". La lista solo filtra cuando de verdad se
// escribió algo — si no, reenfocar un campo ya elegido filtraría por su propio label y dejaría una lista
// de un solo elemento, que no ayuda a cambiar de opción.
const hasTyped = ref(false)

// Mantiene el campo en sintonía cuando el valor cambia desde afuera (v-model seteado por el formulario,
// catálogo que termina de cargar y recién ahí puede resolver el label). No pisa lo que se está
// escribiendo en ese momento.
watch(selectedLabel, (label) => {
  if (!hasTyped.value) searchTerm.value = label ?? ''
})

// Sin distinguir mayúsculas ni tildes — "nunoa" tiene que encontrar "Ñuñoa".
function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}

function matchesSearch(item: CatalogOption) {
  if (!hasTyped.value || !searchTerm.value) return true
  return normalize(item.label).includes(normalize(searchTerm.value))
}

const visibleItems = computed(() => props.items.filter(matchesSearch))

// La lista se abre al escribir, no al enfocar — reenfocar un campo ya elegido no dispara nada, igual que
// en Mercado Libre. Dos excepciones: `showAllOnFocus` (categorías) y el modo error, que si no se
// mostrara apenas hay foco quedaría inalcanzable — el campo de solo lectura no deja escribir para verlo.
const isOpen = computed(() => {
  if (!focused.value) return false
  if (props.error) return true
  return hasTyped.value || Boolean(props.showAllOnFocus)
})

const hasNoMatches = computed(
  () => isOpen.value && !props.pending && !props.error && visibleItems.value.length === 0,
)

function handleInput(value: string | number) {
  searchTerm.value = String(value)
  hasTyped.value = true
}

function handleFocusIn() {
  focused.value = true
}

// focusout (no blur) a nivel del contenedor: permite distinguir "el foco se fue a otra opción de la
// misma lista" (relatedTarget adentro del contenedor, no hacer nada) de "el foco se fue afuera de
// verdad" (ahí sí cerrar). Sin esto, tocar una opción dispara blur del input antes que su propio
// click, y la selección se pierde — el mismo problema de fondo que forzó a abandonar el combobox de
// Reka, resuelto acá con un patrón estándar en vez de pelear contra una librería.
function handleFocusOut(event: FocusEvent) {
  const related = event.relatedTarget
  if (containerRef.value && related instanceof Node && containerRef.value.contains(related)) {
    return
  }
  focused.value = false
  hasTyped.value = false
  // Al salir sin elegir nada, el texto a medio escribir se descarta y vuelve el label elegido (o queda
  // vacío): el campo nunca puede quedar mostrando algo que no está en el catálogo.
  searchTerm.value = selectedLabel.value ?? ''
}

function selectItem(item: CatalogOption) {
  modelValue.value = item.value
  searchTerm.value = item.label
  hasTyped.value = false
  focused.value = false
  // Sin esto, el <input> real del browser puede seguir enfocado (clickear el botón de la opción no
  // siempre le quita el foco al input, depende del browser/SO) — y con foco real todavía puesto ahí,
  // el label recién seleccionado no se termina de ver como texto del campo.
  uInputRef.value?.inputRef?.blur()
}

function retry() {
  emit('retry')
}
</script>

<template>
  <div ref="containerRef" class="relative" @focusin="handleFocusIn" @focusout="handleFocusOut">
    <UInput
      ref="uInputRef"
      :model-value="searchTerm"
      :placeholder="placeholder"
      :readonly="error"
      trailing-icon="i-lucide-chevron-down"
      class="w-full"
      @update:model-value="handleInput"
    />

    <div
      v-if="isOpen"
      class="absolute inset-x-0 top-full z-10 mt-2 max-h-72 overflow-auto rounded-md border p-1 shadow-lg"
      style="background: var(--ui-bg); border-color: var(--ui-border)"
    >
      <template v-if="error">
        <div class="flex flex-col items-center gap-2 px-2 py-3 text-center">
          <p class="text-sm" style="color: var(--ui-text-muted)">{{ errorMessage }}</p>
          <UButton size="sm" data-testid="retry-button" @click="retry">Reintentar</UButton>
        </div>
      </template>
      <template v-else-if="pending">
        <div class="space-y-2 p-2" data-testid="loading-skeleton">
          <div class="h-3 w-3/4 animate-pulse rounded" style="background: var(--ui-bg-elevated)" />
          <div class="h-3 w-1/2 animate-pulse rounded" style="background: var(--ui-bg-elevated)" />
          <div class="h-3 w-2/3 animate-pulse rounded" style="background: var(--ui-bg-elevated)" />
        </div>
      </template>
      <template v-else-if="hasNoMatches">
        <p class="px-2 py-3 text-sm" style="color: var(--ui-text-muted)">No encontramos "{{ searchTerm }}"</p>
      </template>
      <template v-else>
        <button
          v-for="item in visibleItems"
          :key="item.value"
          type="button"
          :data-testid="`option-${item.value}`"
          class="catalog-option flex w-full cursor-pointer items-center rounded-md px-2 py-1.5 text-left text-sm"
          @click="selectItem(item)"
        >
          {{ item.label }}
        </button>
      </template>
    </div>
  </div>
</template>

<style scoped>
.catalog-option {
  color: var(--ui-text-highlighted);
}
.catalog-option:hover {
  background: var(--ui-bg-elevated);
}
</style>
