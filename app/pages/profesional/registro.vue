<script setup lang="ts">
import { TriangleAlert } from '@lucide/vue'

definePageMeta({ middleware: 'profesional' })

useSeoMeta({ title: 'Crea tu perfil', robots: 'noindex' })

const {
  displayName,
  categoriaSlug,
  comunaCodigo,
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
    Boolean(comunaCodigo.value),
    Boolean(contact.value.trim() && !contactError.value),
  ].filter(Boolean).length,
)
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

    <form class="mt-6 flex-1" @submit.prevent="submit">
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

      <label for="registro-comuna" class="mb-2 mt-5 block text-sm font-semibold text-datealo-text">Tu comuna</label>
      <ComunaSelect id="registro-comuna" v-model="comunaCodigo" />

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
