<script setup lang="ts">
import type { Component } from 'vue'

const {
  placeholder = '¿Qué comuna buscas?',
  leadingIcon,
  variant,
  size,
  ui,
  itemIcon,
  panelClass,
} = defineProps<{
  placeholder?: string
  leadingIcon?: string
  variant?: 'outline' | 'ghost'
  size?: 'md' | 'lg' | 'xl'
  ui?: { base?: string, leading?: string, leadingIcon?: string, trailing?: string, trailingIcon?: string }
  itemIcon?: (value: string) => Component
  panelClass?: string
}>()
const modelValue = defineModel<string | null>()
const { items, pending, error, refresh } = useComunasCatalog()
const catalogSelect = useTemplateRef('catalogSelect')

defineExpose({ focus: () => catalogSelect.value?.focus() })
</script>

<template>
  <CatalogSelect
    ref="catalogSelect"
    v-model="modelValue"
    :items
    :pending
    :error
    :placeholder
    :leading-icon="leadingIcon"
    :variant
    :size
    :ui
    :item-icon="itemIcon"
    :panel-class="panelClass"
    error-message="No pudimos cargar las comunas."
    @retry="refresh"
  />
</template>
