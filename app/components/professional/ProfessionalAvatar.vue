<script setup lang="ts">
import { Camera, Loader2 } from '@lucide/vue'

const { professional } = useProfessionalProfile()
const { uploading, uploadError, removing, removeError, upload, remove } = useProfessionalAvatar()

const hasAvatar = computed(() => Boolean(professional.value?.avatarUrl))

const fileInput = ref<HTMLInputElement | null>(null)

function openPicker() {
  fileInput.value?.click()
}

function onFileSelected(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) upload(file)
  if (fileInput.value) fileInput.value.value = ''
}
</script>

<template>
  <div class="rounded-2xl border border-datealo-surface p-4">
    <p class="text-sm font-semibold text-datealo-text">Foto de perfil</p>

    <div class="mt-3 flex items-center gap-4">
      <button
        type="button"
        class="relative flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center overflow-hidden rounded-full disabled:opacity-50"
        :class="hasAvatar ? '' : 'border-2 border-dashed border-datealo-surface text-datealo-muted'"
        :disabled="uploading || removing"
        @click="openPicker"
      >
        <img v-if="hasAvatar" :src="professional!.avatarUrl!" alt="" class="h-full w-full object-cover">
        <Camera v-else-if="!uploading" class="h-6 w-6" />

        <Loader2 v-if="uploading && !hasAvatar" class="h-5 w-5 animate-spin" />
        <div v-if="uploading && hasAvatar" class="absolute inset-0 flex items-center justify-center bg-black/40">
          <Loader2 class="h-5 w-5 animate-spin text-white" />
        </div>
      </button>

      <p v-if="!hasAvatar" class="text-xs text-datealo-muted">
        Para que te reconozcan antes de escribirte. Opcional.
      </p>
      <div v-else>
        <p class="text-xs font-semibold text-datealo-text">Toca la foto para cambiarla</p>
        <button
          type="button"
          class="-m-2 mt-1 inline-block p-2 text-xs font-semibold text-error underline disabled:opacity-50"
          :disabled="removing"
          @click="remove"
        >
          Quitar foto
        </button>
      </div>
    </div>

    <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileSelected">

    <p v-if="uploadError" class="mt-2 text-xs font-semibold text-error" aria-live="polite">{{ uploadError }}</p>
    <p v-if="removeError" class="mt-2 text-xs font-semibold text-error" aria-live="polite">{{ removeError }}</p>
  </div>
</template>
