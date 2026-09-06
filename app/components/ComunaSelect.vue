<script setup lang="ts">
const { placeholder = '¿Qué comuna buscas?', leadingIcon } = defineProps<{ placeholder?: string, leadingIcon?: string }>()
const modelValue = defineModel<string | null>()
const { items, pending, error, refresh } = useComunasCatalog()
const catalogSelect = useTemplateRef('catalogSelect')

defineExpose({ focus: () => catalogSelect.value?.focus() })
</script>

<template>
  <CatalogSelect
    ref="catalogSelect"
    v-model="modelValue"
    :items
    :pending
    :error
    :placeholder
    :leading-icon="leadingIcon"
    error-message="No pudimos cargar las comunas."
    @retry="refresh"
  />
</template>
