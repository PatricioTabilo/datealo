<script setup lang="ts">
import { Loader2, Plus, X } from '@lucide/vue'

const MAX_PHOTOS = 12

const { professional } = useProfessionalProfile()
const { uploading, uploadError, deletingPath, deleteError, upload, remove } = useProfessionalPhotos()

const { public: pub } = useRuntimeConfig()
const photos = computed(() =>
  (professional.value?.photoUrls ?? []).map(url => ({ url, path: photoPathFromUrl(url, pub.supabaseUrl) })),
)

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
    <p class="text-sm font-semibold text-datealo-text">Fotos de tus trabajos</p>

    <div class="mt-3 grid grid-cols-3 gap-2">
      <div v-for="photo in photos" :key="photo.path" class="relative aspect-square overflow-hidden rounded-lg bg-datealo-surface">
        <img :src="photo.url" alt="" class="h-full w-full object-cover">
        <button
          type="button"
          class="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white disabled:opacity-50"
          :disabled="deletingPath === photo.path"
          @click="remove(photo.path)"
        >
          <Loader2 v-if="deletingPath === photo.path" class="h-3.5 w-3.5 animate-spin" />
          <X v-else class="h-3.5 w-3.5" />
        </button>
      </div>

      <button
        v-if="photos.length < MAX_PHOTOS"
        type="button"
        class="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-datealo-surface text-datealo-muted disabled:opacity-50"
        :disabled="uploading"
        @click="openPicker"
      >
        <Loader2 v-if="uploading" class="h-5 w-5 animate-spin" />
        <Plus v-else class="h-6 w-6" />
      </button>
    </div>

    <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileSelected">

    <p v-if="uploadError" class="mt-2 text-xs font-semibold text-error" aria-live="polite">{{ uploadError }}</p>
    <p v-if="deleteError" class="mt-2 text-xs font-semibold text-error" aria-live="polite">{{ deleteError }}</p>
  </div>
</template>
