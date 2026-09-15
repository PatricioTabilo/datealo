<script setup lang="ts">
import { Loader2 } from '@lucide/vue'

definePageMeta({ middleware: 'profesional', layout: 'general' })

useSeoMeta({ title: 'Tu perfil', robots: 'noindex' })

const { professional, pending, loadError, load, savingComunas, comunasSaveError, saveComunas } = useProfessionalProfile()

if (!professional.value) await load()

const comunasLabel = computed(() => {
  const nombres = professional.value?.comunas.map(comuna => comuna.nombre) ?? []
  return new Intl.ListFormat('es-CL', { type: 'conjunction' }).format(nombres)
})

const comunasSheetOpen = ref(false)

const { categorias } = useProfessionalCategorias()
const categoriaSlugs = computed(() => categorias.value.map(c => c.slug))
</script>

<template>
  <div class="mx-auto min-h-screen max-w-md px-5 py-8 pb-16">
    <p v-if="pending" class="text-base text-datealo-muted">Cargando tu perfil…</p>

    <p v-else-if="loadError" class="text-base text-error">{{ loadError }}</p>

    <template v-else-if="professional">
      <h1 class="text-xl font-extrabold text-datealo-text">{{ professional.displayName }}</h1>
      <p class="mt-0.5 text-sm text-datealo-muted">{{ comunasLabel }}</p>

      <ProfessionalAvatar class="mt-5" />

      <ProfessionalPhotos class="mt-3" />

      <p class="mb-2 mt-5 text-xs font-bold uppercase tracking-wide text-datealo-muted">Tus categorías</p>
      <ProfessionalCategoriaBlock
        v-for="categoria in categorias"
        :key="categoria.slug"
        :categoria="categoria"
        :can-remove="categorias.length > 1"
      />
      <ProfessionalCategoriaAddBlock :exclude-slugs="categoriaSlugs" />

      <div class="mt-6 rounded-2xl border border-datealo-surface p-4">
        <p class="mb-1 text-base font-semibold text-datealo-text">Tus datos</p>

        <ProfessionalDataRow label="Nombre" field="displayName" :value="professional.displayName" />
        <div class="border-b border-datealo-surface py-3 text-sm">
          <div class="flex items-center justify-between gap-3">
            <span class="shrink-0 text-datealo-muted">Comunas</span>
            <button
              type="button"
              class="flex min-w-0 flex-1 items-center justify-end gap-1 text-right text-datealo-text"
              @click="comunasSheetOpen = true"
            >
              <span class="min-w-0 truncate">{{ comunasLabel }}</span>
              <Loader2 v-if="savingComunas" class="h-3 w-3 shrink-0 animate-spin" />
            </button>
          </div>
          <p v-if="comunasSaveError" class="mt-1 text-right text-sm font-semibold text-error" aria-live="polite">
            No se pudo guardar, toca para reintentar
          </p>
        </div>
        <ComunasMultiSelect
          v-model:open="comunasSheetOpen"
          :selected="professional.comunas.map(comuna => comuna.codigo)"
          @confirm="saveComunas"
        />
        <ProfessionalDataRow label="Contacto" field="contact" type="tel" :value="professional.contact" />
      </div>
    </template>
  </div>
</template>
