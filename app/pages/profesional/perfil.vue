<script setup lang="ts">
definePageMeta({ middleware: 'profesional', layout: 'general' })

useSeoMeta({ title: 'Tu perfil', robots: 'noindex' })

const { professional, pending, loadError, load } = useProfessionalProfile()

if (!professional.value) await load()

const comunasLabel = computed(() => {
  const nombres = professional.value?.comunas.map(comuna => comuna.nombre) ?? []
  return new Intl.ListFormat('es-CL', { type: 'conjunction' }).format(nombres)
})

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
        <div class="flex items-center justify-between gap-3 border-b border-datealo-surface py-3 text-sm">
          <span class="shrink-0 text-datealo-muted">Comunas</span>
          <span class="text-right text-datealo-text">{{ comunasLabel }}</span>
        </div>
        <ProfessionalDataRow label="Contacto" field="contact" type="tel" :value="professional.contact" />
      </div>
    </template>
  </div>
</template>
