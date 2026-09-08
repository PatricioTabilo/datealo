<script setup lang="ts">
import { Loader2 } from '@lucide/vue'
import type { PublicCategoria } from '~/types/professional'

const props = defineProps<{
  categoria: PublicCategoria
  canRemove: boolean
}>()

const { updateCategoria, removeCategoria, justAddedSlug } = useProfessionalCategorias()

const isEditing = ref(false)
const isSaving = ref(false)
const hasSaveError = ref(false)
const priceDraft = ref('')
const descriptionDraft = ref('')

const confirmingRemove = ref(false)
const isRemoving = ref(false)
const removeErrorMessage = ref<string | null>(null)

const rootEl = ref<HTMLElement | null>(null)

// El bloque muestra precio y descripción juntos en edición (a diferencia de los bloques de un solo
// campo que ya usa el perfil): "toca fuera del bloque" es lo que cierra la edición, no el blur de cada
// campo (eso solo guarda). Un listener de focusout confunde el foco real que sale del bloque con el
// hueco transitorio que deja Vue al reemplazar el botón "Editar" (que tenía el foco) por el input
// nuevo — un click fuera del bloque no tiene esa ambigüedad.
function handleClickOutside(event: MouseEvent) {
  if (!rootEl.value?.contains(event.target as Node)) isEditing.value = false
}

watch(isEditing, (editing) => {
  if (editing) document.addEventListener('click', handleClickOutside, true)
  else document.removeEventListener('click', handleClickOutside, true)
})

onUnmounted(() => document.removeEventListener('click', handleClickOutside, true))

function startEdit() {
  priceDraft.value = props.categoria.priceFrom ? String(props.categoria.priceFrom) : ''
  descriptionDraft.value = props.categoria.description ?? ''
  hasSaveError.value = false
  isEditing.value = true
}

// Un bloque recién creado entra directo en edición: elegir la categoría ya la guardó, lo que falta es
// precio y descripción, sin un toque extra a "Editar" en el medio.
onMounted(() => {
  if (justAddedSlug.value === props.categoria.slug) {
    justAddedSlug.value = null
    startEdit()
  }
})

async function commitPrice() {
  const trimmed = priceDraft.value.trim()
  const parsed = trimmed === '' ? null : Number(trimmed)
  const normalized = parsed !== null && !Number.isNaN(parsed) ? parsed : null
  if (normalized === (props.categoria.priceFrom ?? null)) return
  isSaving.value = true
  hasSaveError.value = !(await updateCategoria(props.categoria.slug, { priceFrom: normalized }))
  isSaving.value = false
}

async function commitDescription() {
  const trimmed = descriptionDraft.value.trim()
  if (trimmed === (props.categoria.description ?? '')) return
  isSaving.value = true
  hasSaveError.value = !(await updateCategoria(props.categoria.slug, { description: trimmed || null }))
  isSaving.value = false
}

function requestRemove() {
  removeErrorMessage.value = null
  confirmingRemove.value = true
}

async function confirmRemove() {
  isRemoving.value = true
  const ok = await removeCategoria(props.categoria.slug)
  isRemoving.value = false
  if (ok) confirmingRemove.value = false
  else removeErrorMessage.value = 'No se pudo quitar la categoría, intenta de nuevo.'
}
</script>

<template>
  <div
    ref="rootEl"
    class="rounded-2xl border p-4"
    :class="isEditing ? 'border-primary bg-primary/5' : 'border-datealo-surface'"
  >
    <div class="flex items-center justify-between gap-2">
      <p class="text-base font-semibold text-datealo-text">{{ categoria.nombre }}</p>
      <button
        v-if="canRemove && !isEditing"
        type="button"
        class="-m-1 shrink-0 px-2 py-1 text-sm font-semibold text-error underline"
        :aria-label="`Quitar ${categoria.nombre}`"
        @click="requestRemove"
      >
        Quitar
      </button>
    </div>

    <template v-if="!isEditing">
      <p class="mt-1.5 text-base">
        <span v-if="categoria.priceFrom" class="text-datealo-text">Desde ${{ formatPriceFrom(categoria.priceFrom) }}</span>
        <span v-else class="italic text-datealo-muted">Sin precio</span>
      </p>
      <p v-if="categoria.description" class="mt-1 text-sm text-datealo-muted">{{ categoria.description }}</p>
      <button
        type="button"
        class="-m-1 mt-2 inline-block px-2 py-1 text-sm font-semibold text-primary underline"
        :aria-label="`Editar ${categoria.nombre}`"
        @click="startEdit"
      >
        Editar
      </button>
    </template>

    <template v-else>
      <div class="mt-2.5 flex items-center gap-2">
        <span class="text-base text-datealo-muted">Desde $</span>
        <UInput
          v-model="priceDraft"
          inputmode="numeric"
          autofocus
          size="lg"
          class="w-32"
          @blur="commitPrice"
          @keyup.enter="commitPrice"
        />
        <Loader2 v-if="isSaving" class="h-3.5 w-3.5 animate-spin text-primary" />
      </div>
      <UTextarea
        v-model="descriptionDraft"
        class="mt-2.5 w-full"
        :rows="2"
        placeholder='Ej: "Reparación de filtraciones, estanques y llaves"'
        @blur="commitDescription"
      />
    </template>

    <p v-if="hasSaveError" class="mt-2 text-sm font-semibold text-error" aria-live="polite">
      No se pudo guardar, toca para reintentar
    </p>
    <p v-if="!canRemove" class="mt-2 text-xs text-datealo-muted">
      No puedes quitar tu única categoría. Agrega otra antes de quitar esta.
    </p>

    <USlideover
      :open="confirmingRemove"
      side="bottom"
      :title="`¿Quitar ${categoria.nombre} de tu perfil?`"
      description="Perderás el precio y la descripción que escribiste para esta categoría."
      :ui="{
        content: 'rounded-t-2xl sm:inset-x-auto sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-md sm:rounded-2xl sm:max-h-[85vh]',
      }"
      @update:open="confirmingRemove = $event"
    >
      <template #body>
        <p v-if="removeErrorMessage" class="mb-3 text-sm font-semibold text-error" aria-live="polite">
          {{ removeErrorMessage }}
        </p>
        <div class="flex gap-3">
          <UButton class="flex-1 justify-center" color="neutral" variant="outline" @click="confirmingRemove = false">
            Cancelar
          </UButton>
          <UButton class="flex-1 justify-center" color="error" :loading="isRemoving" @click="confirmRemove">
            Quitar
          </UButton>
        </div>
      </template>
    </USlideover>
  </div>
</template>
