<script setup lang="ts">
import { Loader2 } from '@lucide/vue'
import type { ProfessionalField } from '~/types/professional'

const props = defineProps<{
  label: string
  field: ProfessionalField
  value: string
  displayValue: string
}>()

const { editingField, savingField, saveErrorField, startEdit, save } = useProfessionalProfile()

const isEditing = computed(() => editingField.value === props.field)
const isSaving = computed(() => savingField.value === props.field)
const hasSaveError = computed(() => saveErrorField.value === props.field)

const draft = ref<string | null>(props.value)

function edit() {
  draft.value = props.value
  startEdit(props.field)
}

// CategoriaSelect/ComunaSelect confirman el valor al elegir una opción de la lista — no hay blur que
// esperar, a diferencia de un input de texto.
function onSelect(newValue: string | null | undefined) {
  if (!newValue || newValue === props.value) return
  save(props.field, newValue)
}
</script>

<template>
  <div class="border-b border-datealo-surface py-3 text-sm last:border-b-0">
    <div class="flex items-center justify-between gap-3">
      <span class="shrink-0 text-datealo-muted">{{ label }}</span>
      <button v-if="!isEditing" type="button" class="text-right text-datealo-text" @click="edit">
        {{ displayValue }}
        <Loader2 v-if="isSaving" class="ml-1 inline h-3 w-3 animate-spin" />
      </button>
      <div v-else class="w-40">
        <slot name="select" :model-value="draft" :update="onSelect" />
      </div>
    </div>
    <p v-if="hasSaveError" class="mt-1 text-right text-xs font-semibold text-error" aria-live="polite">
      No se pudo guardar, toca para reintentar
    </p>
  </div>
</template>
