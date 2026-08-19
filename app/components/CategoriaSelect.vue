<script setup lang="ts">
// No reimplementa nada de la interacción (filtrado, apertura, selección) — eso vive una sola vez en
// CatalogSelect. Si esta lógica se copiara acá, un cambio futuro (ej. otro modo, otro criterio de
// filtro) se podría actualizar en CategoriaSelect y olvidarse en ComunaSelect, y las dos empezarían a
// comportarse distinto sin que nadie lo note (T-003). Este wrapper solo conecta su catálogo con el
// componente compartido.
//
// showAllOnFocus: true porque son solo 8 categorías — mostrarlas todas al enfocar no es ruido, a
// diferencia de las 346 comunas de ComunaSelect (UX-002).
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
