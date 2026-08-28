<script setup lang="ts">
import { Loader2 } from '@lucide/vue'

definePageMeta({ middleware: 'profesional' })

useSeoMeta({ title: 'Tu perfil', robots: 'noindex' })

const { professional, pending, loadError, editingField, savingField, saveErrorField, startEdit, cancelEdit, save, load } = useProfessionalProfile()

if (!professional.value) await load()

const { items: categoriaItems } = useCategoriasCatalog()
const { items: comunaItems } = useComunasCatalog()

const categoriaNombre = computed(
  () => categoriaItems.value.find(item => item.value === professional.value?.categoriaSlug)?.label
    ?? professional.value?.categoriaSlug ?? '',
)
const comunaNombre = computed(
  () => comunaItems.value.find(item => item.value === professional.value?.comunaCodigo)?.label
    ?? professional.value?.comunaCodigo ?? '',
)

const isEditingDescription = computed(() => editingField.value === 'description')
const isSavingDescription = computed(() => savingField.value === 'description')
const hasDescriptionError = computed(() => saveErrorField.value === 'description')
const descriptionDraft = ref('')

function editDescription() {
  descriptionDraft.value = professional.value?.description ?? ''
  startEdit('description')
}

function commitDescription() {
  const trimmed = descriptionDraft.value.trim()
  if (trimmed === (professional.value?.description ?? '')) {
    cancelEdit()
    return
  }
  save('description', trimmed || null)
}

const isEditingPrice = computed(() => editingField.value === 'priceFrom')
const isSavingPrice = computed(() => savingField.value === 'priceFrom')
const hasPriceError = computed(() => saveErrorField.value === 'priceFrom')
const priceDraft = ref('')

function editPrice() {
  priceDraft.value = professional.value?.priceFrom ? String(professional.value.priceFrom) : ''
  startEdit('priceFrom')
}

function commitPrice() {
  const trimmed = priceDraft.value.trim()
  const parsed = trimmed === '' ? null : Number(trimmed)
  const normalized = parsed !== null && !Number.isNaN(parsed) ? parsed : null
  if (normalized === (professional.value?.priceFrom ?? null)) {
    cancelEdit()
    return
  }
  save('priceFrom', normalized)
}
</script>

<template>
  <div class="mx-auto min-h-screen max-w-md px-5 py-8 pb-16">
    <p v-if="pending" class="text-sm text-datealo-muted">Cargando tu perfil…</p>

    <p v-else-if="loadError" class="text-sm text-error">{{ loadError }}</p>

    <template v-else-if="professional">
      <h1 class="text-xl font-extrabold text-datealo-text">{{ professional.displayName }}</h1>
      <p class="mt-0.5 text-sm text-datealo-muted">{{ categoriaNombre }} · {{ comunaNombre }}</p>

      <div class="mt-5 rounded-2xl border border-datealo-surface p-4">
        <div class="flex items-center justify-between">
          <p class="text-sm font-semibold text-datealo-text">Descripción</p>
          <Loader2 v-if="isSavingDescription" class="h-3.5 w-3.5 animate-spin text-primary" />
        </div>

        <p v-if="!isEditingDescription && professional.description" class="mt-1 text-sm text-datealo-text">
          {{ professional.description }}
        </p>
        <button
          v-else-if="!isEditingDescription"
          type="button"
          class="mt-1 text-left text-sm italic text-datealo-muted"
          @click="editDescription"
        >
          Ej: "Electricista con 10 años de experiencia en Ñuñoa"
        </button>
        <UTextarea
          v-else
          v-model="descriptionDraft"
          autofocus
          class="mt-2 w-full"
          :rows="2"
          @blur="commitDescription"
        />
        <button
          v-if="!isEditingDescription && professional.description"
          type="button"
          class="mt-1 text-xs font-semibold text-primary underline"
          @click="editDescription"
        >
          Editar
        </button>
        <p v-if="hasDescriptionError" class="mt-2 text-xs font-semibold text-error" aria-live="polite">
          No se pudo guardar, toca para reintentar
        </p>
      </div>

      <div class="mt-3 rounded-2xl border border-datealo-surface p-4">
        <div class="flex items-center justify-between">
          <p class="text-sm font-semibold text-datealo-text">Precio</p>
          <Loader2 v-if="isSavingPrice" class="h-3.5 w-3.5 animate-spin text-primary" />
        </div>

        <button v-if="!isEditingPrice" type="button" class="mt-1 block text-left text-sm" @click="editPrice">
          <template v-if="professional.priceFrom">
            <span class="text-datealo-text">Desde ${{ formatPriceFrom(professional.priceFrom) }}</span>
          </template>
          <template v-else>
            <span class="text-datealo-muted">Desde $</span>
            <span class="italic text-datealo-muted">Ej: 10.000</span>
          </template>
        </button>
        <div v-else class="mt-2 flex items-center gap-2">
          <span class="text-sm text-datealo-muted">Desde $</span>
          <UInput
            v-model="priceDraft"
            inputmode="numeric"
            autofocus
            size="sm"
            class="w-32"
            @blur="commitPrice"
            @keyup.enter="commitPrice"
          />
        </div>
        <p v-if="hasPriceError" class="mt-2 text-xs font-semibold text-error" aria-live="polite">
          No se pudo guardar, toca para reintentar
        </p>
      </div>

      <div class="mt-3 rounded-2xl border border-datealo-surface p-4">
        <p class="mb-1 text-sm font-semibold text-datealo-text">Tus datos</p>

        <ProfessionalDataRow label="Nombre" field="displayName" :value="professional.displayName" />
        <ProfessionalCatalogRow
          label="Categoría"
          field="categoriaSlug"
          :value="professional.categoriaSlug"
          :display-value="categoriaNombre"
        >
          <template #select="{ modelValue, update }">
            <CategoriaSelect :model-value="modelValue" @update:model-value="update" />
          </template>
        </ProfessionalCatalogRow>
        <ProfessionalCatalogRow
          label="Comuna"
          field="comunaCodigo"
          :value="professional.comunaCodigo"
          :display-value="comunaNombre"
        >
          <template #select="{ modelValue, update }">
            <ComunaSelect :model-value="modelValue" @update:model-value="update" />
          </template>
        </ProfessionalCatalogRow>
        <ProfessionalDataRow label="Contacto" field="contact" type="tel" :value="professional.contact" />
      </div>
    </template>
  </div>
</template>
