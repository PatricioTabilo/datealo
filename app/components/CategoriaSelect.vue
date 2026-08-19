<script setup lang="ts">
// Wrapper delgado: conecta useCategoriasCatalog() con CatalogSelect, sin markup ni lógica propia (T-003,
// TC-004). showAllOnFocus: true porque son solo 8 categorías — mostrarlas todas al enfocar no es ruido,
// a diferencia de las 346 comunas de ComunaSelect (UX-002).
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
