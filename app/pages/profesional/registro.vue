<script setup lang="ts">
import { ChevronDown, TriangleAlert } from '@lucide/vue'

definePageMeta({ middleware: 'profesional', layout: 'general' })

useSeoMeta({ title: 'Crea tu perfil', robots: 'noindex' })

const {
  displayName,
  categoriaSlug,
  comunaCodigos,
  contact,
  contactError,
  loading,
  submitError,
  isComplete,
  validateContact,
  submit,
} = useProfessionalRegistration()

const completedCount = computed(() =>
  [
    Boolean(displayName.value.trim()),
    Boolean(categoriaSlug.value),
    comunaCodigos.value.length > 0,
    Boolean(contact.value.trim() && !contactError.value),
  ].filter(Boolean).length,
)

const { items: comunaItems } = useComunasCatalog()
const comunasSheetOpen = ref(false)
const comunasLabel = computed(() => {
  const nombres = comunaItems.value.filter(item => comunaCodigos.value.includes(item.value)).map(item => item.label)
  return new Intl.ListFormat('es-CL', { type: 'conjunction' }).format(nombres)
})

// ComunasMultiSelect no tiene un DialogTrigger propio (se controla 100% por :open) — sin este watch, el
// foco quedaría huérfano al cerrar el sheet en vez de volver al campo que lo abrió.
const comunasTrigger = useTemplateRef('comunasTrigger')
watch(comunasSheetOpen, (isOpen, wasOpen) => {
  if (!isOpen && wasOpen) comunasTrigger.value?.focus()
})
</script>

<template>
  <div class="mx-auto flex min-h-screen max-w-md flex-col px-6 py-8">
    <h1 class="text-2xl font-extrabold text-datealo-text">Crea tu perfil</h1>
    <div class="mt-4 flex gap-1.5">
      <div
        v-for="n in 4"
        :key="n"
        class="h-1.5 flex-1 rounded-full"
        :class="n <= completedCount ? 'bg-primary' : 'bg-datealo-surface'"
      />
    </div>

    <p
      v-if="submitError"
      class="mt-4 flex items-start gap-2 rounded-lg bg-error/10 p-3 text-sm text-error"
      aria-live="polite"
    >
      <TriangleAlert class="mt-0.5 h-4 w-4 shrink-0" />
      {{ submitError }}
    </p>

    <form class="mt-6 flex-1" novalidate @submit.prevent="submit">
      <label for="registro-nombre" class="mb-2 block text-sm font-semibold text-datealo-text">Tu nombre</label>
      <UInput
        id="registro-nombre"
        v-model="displayName"
        placeholder="Ej: Héctor Silva"
        size="lg"
        class="w-full"
        :disabled="loading"
      />

      <label for="registro-categoria" class="mb-2 mt-5 block text-sm font-semibold text-datealo-text">
        Tu categoría
      </label>
      <CategoriaSelect id="registro-categoria" v-model="categoriaSlug" />
      <p class="mt-1.5 text-sm text-datealo-muted">Puedes agregar otras categorías más adelante, desde tu perfil.</p>

      <p class="mb-2 mt-5 text-sm font-semibold text-datealo-text">Tus comunas</p>
      <button
        ref="comunasTrigger"
        type="button"
        aria-label="Tus comunas"
        class="flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border border-accented px-4 py-3"
        :disabled="loading"
        @click="comunasSheetOpen = true"
      >
        <span class="truncate text-sm" :class="comunaCodigos.length ? 'text-datealo-text' : 'text-datealo-muted'">
          {{ comunaCodigos.length ? comunasLabel : '¿Dónde atiendes?' }}
        </span>
        <ChevronDown class="h-4 w-4 shrink-0 text-datealo-muted" />
      </button>
      <ComunasMultiSelect
        v-model:open="comunasSheetOpen"
        :selected="comunaCodigos"
        @confirm="comunaCodigos = $event"
      />

      <label for="registro-contacto" class="mb-2 mt-5 block text-sm font-semibold text-datealo-text">
        Tu contacto (WhatsApp o teléfono)
      </label>
      <UInput
        id="registro-contacto"
        v-model="contact"
        placeholder="+56 9 …"
        size="lg"
        class="w-full"
        :disabled="loading"
        :color="contactError ? 'error' : 'primary'"
        :highlight="Boolean(contactError)"
        :aria-describedby="contactError ? 'registro-contacto-error' : undefined"
        @blur="validateContact"
      />
      <p
        v-if="contactError"
        id="registro-contacto-error"
        class="mt-2 text-xs font-semibold text-error"
        aria-live="polite"
      >
        {{ contactError }}
      </p>
    </form>

    <div class="mt-6">
      <UButton
        type="submit"
        block
        size="lg"
        class="font-bold"
        :disabled="!isComplete || loading"
        :loading="loading"
        @click="submit"
      >
        <template v-if="!loading">Publicar mi perfil</template>
      </UButton>
      <p v-if="!isComplete" class="mt-2 text-center text-xs text-datealo-muted">
        Completa los 4 campos para continuar
      </p>
    </div>
  </div>
</template>
