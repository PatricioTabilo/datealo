<script setup lang="ts">
const modelValue = defineModel<string | null>()
const { items, pending, error, refresh } = useComunasCatalog()
</script>

<template>
  <CatalogSelect
    v-model="modelValue"
    :items
    :pending
    :error
    placeholder="¿Qué comuna buscas?"
    error-message="No pudimos cargar las comunas."
    @retry="refresh"
  />
</template>
