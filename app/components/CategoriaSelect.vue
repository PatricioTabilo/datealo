<script setup lang="ts">
import type { Component } from 'vue'

const {
  placeholder = '¿Qué necesitas?',
  leadingIcon,
  variant,
  size,
  ui,
  itemIcon,
  panelClass,
  exclude,
} = defineProps<{
  placeholder?: string
  leadingIcon?: string
  variant?: 'outline' | 'ghost'
  size?: 'md' | 'lg' | 'xl'
  ui?: { base?: string, leading?: string, leadingIcon?: string, trailing?: string, trailingIcon?: string }
  itemIcon?: (value: string) => Component
  panelClass?: string
  exclude?: string[]
}>()
const modelValue = defineModel<string | null>()
const { items: allItems, pending, error, refresh } = useCategoriasCatalog()
const items = computed(() => allItems.value.filter(item => !exclude?.includes(item.value)))

const catalogSelectRef = ref<{ focus: () => void } | null>(null)
defineExpose({ focus: () => catalogSelectRef.value?.focus() })
</script>

<template>
  <CatalogSelect
    ref="catalogSelectRef"
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
    error-message="No pudimos cargar las categorías."
    :show-all-on-focus="true"
    @retry="refresh"
  />
</template>
