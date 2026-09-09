<script setup lang="ts">
import { UModal, USlideover } from '#components'
import type { PublicCategoria } from '~/types/professional'

const props = defineProps<{
  categoria: PublicCategoria
  canRemove: boolean
}>()

const { updateCategoria, removeCategoria } = useProfessionalCategorias()

const isEditing = ref(false)
const isSaving = ref(false)
const hasSaveError = ref(false)
const priceDraft = ref('')
const descriptionDraft = ref('')

const confirmingRemove = ref(false)
const isRemoving = ref(false)
const removeErrorMessage = ref<string | null>(null)

// USlideover trae su propia animación de deslizar desde abajo — forzarlo a quedar centrado en desktop
// con clases pelea contra esa animación (el contenido termina centrado, pero se ve deslizar desde fuera
// del viewport en el camino). Elegir el componente según el ancho evita esa pelea: cada uno anima de la
// forma que ya trae resuelta.
const isDesktop = ref(false)
let desktopQuery: MediaQueryList | undefined

function syncIsDesktop(event: MediaQueryList | MediaQueryListEvent) {
  isDesktop.value = event.matches
}

onMounted(() => {
  desktopQuery = window.matchMedia('(min-width: 640px)')
  syncIsDesktop(desktopQuery)
  desktopQuery.addEventListener('change', syncIsDesktop)
})

onUnmounted(() => desktopQuery?.removeEventListener('change', syncIsDesktop))

function startEdit() {
  priceDraft.value = props.categoria.priceFrom ? String(props.categoria.priceFrom) : ''
  descriptionDraft.value = props.categoria.description ?? ''
  hasSaveError.value = false
  isEditing.value = true
}

function cancelEdit() {
  isEditing.value = false
  hasSaveError.value = false
}

async function saveEdit() {
  const trimmedPrice = priceDraft.value.trim()
  const parsedPrice = trimmedPrice === '' ? null : Number(trimmedPrice)
  const priceFrom = parsedPrice !== null && !Number.isNaN(parsedPrice) ? parsedPrice : null
  const description = descriptionDraft.value.trim() || null

  isSaving.value = true
  const ok = await updateCategoria(props.categoria.slug, { priceFrom, description })
  isSaving.value = false
  hasSaveError.value = !ok
  if (ok) isEditing.value = false
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
        <UInput v-model="priceDraft" inputmode="numeric" autofocus size="lg" class="w-32" />
      </div>
      <UTextarea
        v-model="descriptionDraft"
        class="mt-2.5 w-full"
        :rows="2"
        placeholder='Ej: "Reparación de filtraciones, estanques y llaves"'
      />
      <p v-if="hasSaveError" class="mt-2 text-sm font-semibold text-error" aria-live="polite">
        No se pudo guardar. Toca "Guardar cambios" para reintentar.
      </p>
      <div class="mt-3 flex gap-3">
        <UButton class="flex-1 justify-center" color="neutral" variant="outline" @click="cancelEdit">
          Cancelar
        </UButton>
        <UButton class="flex-1 justify-center" :loading="isSaving" @click="saveEdit">
          Guardar cambios
        </UButton>
      </div>
    </template>

    <p v-if="!canRemove" class="mt-2 text-xs text-datealo-muted">
      No puedes quitar tu única categoría. Agrega otra antes de quitar esta.
    </p>

    <component
      :is="isDesktop ? UModal : USlideover"
      :open="confirmingRemove"
      :side="isDesktop ? undefined : 'bottom'"
      :title="`¿Quitar ${categoria.nombre} de tu perfil?`"
      description="Perderás el precio y la descripción que escribiste para esta categoría."
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
    </component>
  </div>
</template>
