<script setup lang="ts">
const { placeholder = '¿Qué necesitas?', leadingIcon } = defineProps<{ placeholder?: string, leadingIcon?: string }>()
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
    error-message="No pudimos cargar las categorías."
    :show-all-on-focus="true"
    @retry="refresh"
  />
</template>
