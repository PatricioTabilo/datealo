<script setup lang="ts">
const props = defineProps<{ excludeSlugs: string[] }>()

const { addCategoria } = useProfessionalCategorias()

const adding = ref(false)
const categoriaSlug = ref<string | null>(null)
const priceDraft = ref('')
const descriptionDraft = ref('')
const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)
const selectRef = ref<{ focus: () => void } | null>(null)

function start() {
  errorMessage.value = null
  categoriaSlug.value = null
  priceDraft.value = ''
  descriptionDraft.value = ''
  adding.value = true
  nextTick(() => selectRef.value?.focus())
}

function cancel() {
  adding.value = false
}

async function save() {
  if (!categoriaSlug.value) return

  const trimmedPrice = priceDraft.value.trim()
  const parsedPrice = trimmedPrice === '' ? null : Number(trimmedPrice)
  const priceFrom = parsedPrice !== null && !Number.isNaN(parsedPrice) ? parsedPrice : null
  const description = descriptionDraft.value.trim() || null

  isSubmitting.value = true
  errorMessage.value = null
  const ok = await addCategoria(categoriaSlug.value, { priceFrom, description })
  isSubmitting.value = false
  if (ok) adding.value = false
  else errorMessage.value = "No se pudo guardar. Toca \"Guardar categoría\" para reintentar."
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
      v-model="categoriaSlug"
      :exclude="props.excludeSlugs"
    />
    <div class="mt-2.5 flex items-center gap-2">
      <span class="text-base text-datealo-muted">Desde $</span>
      <UInput v-model="priceDraft" inputmode="numeric" size="lg" class="w-32" />
    </div>
    <UTextarea
      v-model="descriptionDraft"
      class="mt-2.5 w-full"
      :rows="2"
      placeholder='Ej: "Corte de pasto y desmalezado con máquina"'
    />
    <p v-if="errorMessage" class="mt-2 text-sm font-semibold text-error" aria-live="polite">{{ errorMessage }}</p>
    <div class="mt-3 flex gap-3">
      <UButton class="flex-1 justify-center" color="neutral" variant="outline" @click="cancel">
        Cancelar
      </UButton>
      <UButton class="flex-1 justify-center" :disabled="!categoriaSlug" :loading="isSubmitting" @click="save">
        Guardar categoría
      </UButton>
    </div>
  </div>
</template>
