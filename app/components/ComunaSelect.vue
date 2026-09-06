<script setup lang="ts">
const {
  placeholder = '¿Qué comuna buscas?',
  leadingIcon,
  variant,
  size,
  ui,
} = defineProps<{
  placeholder?: string
  leadingIcon?: string
  variant?: 'outline' | 'ghost'
  size?: 'md' | 'lg' | 'xl'
  ui?: { base?: string, leading?: string, leadingIcon?: string, trailing?: string, trailingIcon?: string }
}>()
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
    :variant
    :size
    :ui
    error-message="No pudimos cargar las comunas."
    @retry="refresh"
  />
</template>
