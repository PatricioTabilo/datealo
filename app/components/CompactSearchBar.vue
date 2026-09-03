<script setup lang="ts">
import { Search, X } from '@lucide/vue'

const {
  categoriaSlug,
  comunaCodigo,
  isOpen,
  activeField,
  ready,
  open,
  close,
  selectCategoria,
  selectComuna,
  confirm,
} = useCompactSearch()

const { items: categoriaItems } = useCategoriasCatalog()
const { items: comunaItems } = useComunasCatalog()

const categoriaLabel = computed(() => categoriaItems.value.find(item => item.value === categoriaSlug.value)?.label ?? null)
const comunaLabel = computed(() => comunaItems.value.find(item => item.value === comunaCodigo.value)?.label ?? null)

const summary = computed(() => {
  if (!categoriaLabel.value) return null
  return comunaLabel.value ? `${categoriaLabel.value} en ${comunaLabel.value}` : categoriaLabel.value
})
</script>

<template>
  <div class="relative w-full lg:w-auto">
    <button
      type="button"
      class="flex w-full items-center gap-2.5 rounded-full border border-datealo-surface bg-white px-4.5 py-3.5 text-left shadow-[0_6px_16px_-8px_rgba(31,41,55,0.15)] lg:hidden"
      @click="open()"
    >
      <Search class="h-4 w-4 shrink-0 text-primary" />
      <span v-if="summary" class="truncate text-sm font-bold text-datealo-text">{{ summary }}</span>
      <span v-else class="text-sm font-medium text-datealo-muted">¿Qué profesional buscas?</span>
    </button>

    <div class="relative z-40 hidden items-center gap-1 rounded-full bg-white p-1.5 shadow-[0_6px_18px_-8px_rgba(31,41,55,0.18)] lg:flex">
      <button
        type="button"
        class="flex min-w-48 flex-col justify-center rounded-full px-6 py-3 text-left hover:bg-datealo-surface"
        @click="open('categoria')"
      >
        <span class="text-xs font-bold uppercase tracking-wide text-datealo-muted">Categoría</span>
        <span class="text-sm font-bold" :class="categoriaLabel ? 'text-datealo-text' : 'font-medium text-datealo-muted'">
          {{ categoriaLabel ?? 'Elige categoría' }}
        </span>
      </button>
      <div class="h-8 w-px shrink-0 bg-datealo-surface" />
      <button
        type="button"
        class="flex min-w-48 flex-col justify-center rounded-full px-6 py-3 text-left hover:bg-datealo-surface"
        @click="open('comuna')"
      >
        <span class="text-xs font-bold uppercase tracking-wide text-datealo-muted">Comuna</span>
        <span class="text-sm font-bold" :class="comunaLabel ? 'text-datealo-text' : 'font-medium text-datealo-muted'">
          {{ comunaLabel ?? 'Elige comuna' }}
        </span>
      </button>
      <button
        type="button"
        aria-label="Buscar"
        :disabled="!ready"
        class="ml-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white disabled:cursor-not-allowed"
        :class="ready ? 'bg-secondary' : 'bg-secondary/50'"
        @click="confirm"
      >
        <Search class="h-5 w-5" />
      </button>
    </div>

    <Teleport to="body">
      <div v-if="isOpen" class="fixed inset-0 z-40 flex h-dvh flex-col bg-datealo-bg lg:hidden">
        <div class="flex items-center justify-between px-5 py-4">
          <p class="font-heading text-base font-extrabold text-datealo-text">
            {{ activeField === 'categoria' ? '¿Qué necesitas?' : '¿Dónde?' }}
          </p>
          <button
            type="button"
            aria-label="Cerrar"
            class="flex h-9 w-9 items-center justify-center rounded-full border border-datealo-surface"
            @click="close"
          >
            <X class="h-4 w-4 text-datealo-text" />
          </button>
        </div>
        <div class="flex-1 overflow-y-auto px-4 pb-24">
          <CompactSearchBarPanel :active-field="activeField" @select-categoria="selectCategoria" @select-comuna="selectComuna" />
        </div>
        <div class="absolute inset-x-5 bottom-5">
          <button
            type="button"
            :disabled="!ready"
            class="w-full rounded-full py-4 text-center text-[0.9375rem] font-bold disabled:cursor-not-allowed"
            :class="ready ? 'bg-secondary text-white shadow-[0_10px_24px_-8px_rgba(62,203,215,0.5)]' : 'bg-datealo-surface text-datealo-muted'"
            @click="confirm"
          >
            Buscar
          </button>
        </div>
      </div>
    </Teleport>

    <div
      v-if="isOpen"
      class="absolute left-0 top-full z-40 mt-3 hidden w-96 rounded-2xl border border-datealo-surface bg-white p-4 shadow-[0_24px_48px_-16px_rgba(31,41,55,0.3)] lg:block"
    >
      <CompactSearchBarPanel :active-field="activeField" @select-categoria="selectCategoria" @select-comuna="selectComuna" />
    </div>

    <div v-if="isOpen" class="fixed inset-0 z-30 hidden lg:block" @click="close" />
  </div>
</template>
