<script setup lang="ts">
import { Loader2 } from '@lucide/vue'
import type { ProfessionalField } from '~/types/professional'

const props = defineProps<{
  label: string
  field: ProfessionalField
  value: string
  type?: 'text' | 'tel'
}>()

const { editingField, savingField, fieldError, saveErrorField, startEdit, cancelEdit, save } = useProfessionalProfile()

const isEditing = computed(() => editingField.value === props.field)
const isSaving = computed(() => savingField.value === props.field)
const hasSaveError = computed(() => saveErrorField.value === props.field)

const draft = ref(props.value)

function edit() {
  if (!hasSaveError.value) draft.value = props.value
  startEdit(props.field)
}

function commit() {
  if (draft.value.trim() === props.value) {
    cancelEdit()
    return
  }
  save(props.field, draft.value.trim())
}
</script>

<template>
  <div class="border-b border-datealo-surface py-3 text-sm last:border-b-0">
    <div class="flex items-center justify-between gap-3">
      <span class="shrink-0 text-datealo-muted">{{ label }}</span>
      <button v-if="!isEditing" type="button" class="text-right text-datealo-text" @click="edit">
        {{ value }}
        <Loader2 v-if="isSaving" class="ml-1 inline h-3 w-3 animate-spin" />
      </button>
      <UInput
        v-else
        v-model="draft"
        :type="type === 'tel' ? 'tel' : 'text'"
        size="sm"
        class="w-40"
        autofocus
        :color="fieldError ? 'error' : 'primary'"
        :highlight="Boolean(fieldError)"
        @blur="commit"
        @keyup.enter="commit"
      />
    </div>
    <p v-if="isEditing && fieldError" class="mt-1 text-right text-xs font-semibold text-error" aria-live="polite">
      {{ fieldError }}
    </p>
    <p v-if="hasSaveError" class="mt-1 text-right text-xs font-semibold text-error" aria-live="polite">
      No se pudo guardar, toca para reintentar
    </p>
  </div>
</template>
