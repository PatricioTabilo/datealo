<script setup lang="ts">
const modelValue = defineModel<string | null>()
const { items, pending, error, refresh } = useCategoriasCatalog()
</script>

<template>
  <CatalogSelect
    v-model="modelValue"
    :items
    :pending
    :error
    placeholder="¿Qué necesitas?"
    error-message="No pudimos cargar las categorías."
    :show-all-on-focus="true"
    @retry="refresh"
  />
</template>
