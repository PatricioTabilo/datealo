<script setup lang="ts">
import { Star } from '@lucide/vue'

const props = withDefaults(defineProps<{
  modelValue: number
  readonly?: boolean
  size?: 'sm' | 'lg'
}>(), { readonly: false, size: 'sm' })

const emit = defineEmits<{ 'update:modelValue': [value: number] }>()

const STARS = [1, 2, 3, 4, 5]
const iconClass = computed(() => props.size === 'lg' ? 'h-7 w-7' : 'h-3 w-3')
// El botón, no el ícono, define el objetivo táctil — 44×44px en el sheet interactivo; el tamaño
// chico de la card de lectura no necesita ese mínimo, no es interactivo.
const targetClass = computed(() => props.size === 'lg' ? 'h-11 w-11' : 'h-4 w-4')
</script>

<template>
  <div
    :role="readonly ? undefined : 'radiogroup'"
    :aria-label="readonly ? undefined : 'Calificación'"
    class="flex gap-1"
  >
    <button
      v-for="star in STARS"
      :key="star"
      type="button"
      :disabled="readonly"
      :role="readonly ? undefined : 'radio'"
      :aria-checked="readonly ? undefined : star === modelValue"
      :aria-label="`${star} ${star > 1 ? 'estrellas' : 'estrella'}`"
      class="flex items-center justify-center"
      :class="[targetClass, readonly ? 'cursor-default' : 'cursor-pointer']"
      @click="!readonly && emit('update:modelValue', star)"
    >
      <Star :class="[iconClass, star <= modelValue ? 'fill-amber-400 text-amber-400' : 'text-gray-300']" />
    </button>
  </div>
</template>
