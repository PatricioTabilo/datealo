<script setup lang="ts">
// Wrapper delgado: conecta useComunasCatalog() con CatalogSelect, sin markup ni lógica propia (T-003,
// TC-004). Sin showAllOnFocus (default false): con ~33 comunas activas, mostrar todo al enfocar es más
// ruido que ayuda — el patrón de Mercado Libre es esperar a que se escriba (UX-001).
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
