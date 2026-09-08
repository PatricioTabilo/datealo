<script setup lang="ts">
const props = defineProps<{ excludeSlugs: string[] }>()

const { addCategoria } = useProfessionalCategorias()

const adding = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)
const selectRef = ref<{ focus: () => void } | null>(null)

function start() {
  errorMessage.value = null
  adding.value = true
  nextTick(() => selectRef.value?.focus())
}

function cancel() {
  adding.value = false
}

async function onChoose(categoriaSlug: string | null | undefined) {
  if (!categoriaSlug) return
  isSubmitting.value = true
  errorMessage.value = null
  const ok = await addCategoria(categoriaSlug)
  isSubmitting.value = false
  if (ok) adding.value = false
  else errorMessage.value = 'No se pudo agregar la categoría, intenta de nuevo.'
}
</script>

<template>
  <button
    v-if="!adding"
    type="button"
    class="mt-3 w-full rounded-2xl border-[1.5px] border-dashed border-accented px-4 py-3.5 text-center text-sm font-bold text-primary"
    @click="start"
  >
    + Agregar categoría
  </button>

  <div v-else class="mt-3 rounded-2xl border border-primary bg-primary/5 p-4">
    <p class="text-base font-semibold text-datealo-text">Categoría nueva</p>
    <CategoriaSelect
      ref="selectRef"
      class="mt-2"
      :model-value="null"
      :exclude="props.excludeSlugs"
      @update:model-value="onChoose"
    />
    <p v-if="errorMessage" class="mt-2 text-sm font-semibold text-error" aria-live="polite">{{ errorMessage }}</p>
    <button type="button" class="-m-1 mt-2.5 px-1 py-1 text-sm font-semibold text-datealo-muted underline" @click="cancel">
      Cancelar
    </button>
  </div>
</template>
