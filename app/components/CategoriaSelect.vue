<script setup lang="ts">
const {
  placeholder = '¿Qué necesitas?',
  leadingIcon,
  variant,
  size,
  inputClass,
} = defineProps<{
  placeholder?: string
  leadingIcon?: string
  variant?: 'outline' | 'ghost'
  size?: 'md' | 'lg' | 'xl'
  inputClass?: string
}>()
const modelValue = defineModel<string | null>()
const { items, pending, error, refresh } = useCategoriasCatalog()
</script>

<template>
  <CatalogSelect
    v-model="modelValue"
    :items
    :pending
    :error
    :placeholder
    :leading-icon="leadingIcon"
    :variant
    :size
    :input-class="inputClass"
    error-message="No pudimos cargar las categorías."
    :show-all-on-focus="true"
    @retry="refresh"
  />
</template>
