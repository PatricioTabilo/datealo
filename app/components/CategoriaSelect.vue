<script setup lang="ts">
// Categorías son solo 8 — mostrarlas todas al enfocar no es ruido, por eso showAllOnFocus (UX-002).
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
