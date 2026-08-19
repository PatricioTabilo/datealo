<script setup lang="ts">
// No reimplementa nada de la interacción (filtrado, apertura, selección) — eso vive una sola vez en
// CatalogSelect. Si esta lógica se copiara acá, un cambio futuro (ej. otro modo, otro criterio de
// filtro) se podría actualizar en ComunaSelect y olvidarse en CategoriaSelect, y las dos empezarían a
// comportarse distinto sin que nadie lo note (T-003). Este wrapper solo conecta su catálogo con el
// componente compartido.
//
// Sin showAllOnFocus (default false): con ~35 comunas activas, mostrar todo al enfocar es más ruido
// que ayuda — el patrón de Mercado Libre es esperar a que se escriba (UX-001).
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
