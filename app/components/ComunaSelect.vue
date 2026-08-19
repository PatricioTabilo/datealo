<script setup lang="ts">
// Con ~35 comunas activas, mostrar todo al enfocar es ruido — se espera a que se escriba, como Mercado
// Libre (UX-001). Por eso no pasa showAllOnFocus (default false), a diferencia de CategoriaSelect.
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
