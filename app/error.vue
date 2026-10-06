<script setup lang="ts">
import type { NuxtError } from '#app'
import { CircleAlert } from '@lucide/vue'

const props = defineProps<{ error: NuxtError }>()

const route = useRoute()
const isNotFound = computed(() => props.error.status === 404)

useSeoMeta({
  title: () => isNotFound.value ? 'Página no encontrada' : 'Algo salió mal',
  robots: 'noindex',
})

// Recarga completa: vuelve a pedir la página al servidor, y si el error persiste, Nuxt muestra esta página
// de nuevo. force hace que cada toque recargue, incluso dos seguidos.
const retry = () => reloadNuxtApp({ path: route.fullPath, force: true })
</script>

<template>
  <div class="flex min-h-screen flex-col bg-datealo-bg">
    <header class="px-5 py-4 lg:px-12 lg:py-6">
      <NuxtLink to="/" class="font-heading text-2xl font-extrabold text-primary lg:text-3xl">
        datea<span class="text-secondary">lo</span>
      </NuxtLink>
    </header>

    <main class="flex flex-1 flex-col items-center justify-center px-5 pb-16 text-center">
      <p
        v-if="isNotFound"
        aria-hidden="true"
        class="font-heading text-[7rem] leading-none font-extrabold tracking-tight lg:text-[10rem]"
      >
        <span class="text-primary">4</span><span class="text-secondary">0</span><span class="text-primary">4</span>
      </p>
      <div v-else class="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-datealo-100">
        <CircleAlert class="h-10 w-10 text-primary" />
      </div>

      <h1 class="mt-6 font-heading text-2xl font-extrabold text-datealo-text text-balance lg:text-3xl">
        {{ isNotFound ? 'No encontramos esta página' : 'Algo salió mal' }}
      </h1>
      <p class="mt-3 max-w-sm text-base text-datealo-muted">
        {{ isNotFound
          ? 'Puede que el link esté mal escrito o que la página ya no exista.'
          : 'Tuvimos un problema al cargar esta página. Intenta de nuevo en un rato.' }}
      </p>

      <div class="mt-8 flex w-full max-w-xs flex-col gap-3">
        <UButton v-if="isNotFound" to="/buscar" size="xl" block>Buscar profesionales</UButton>
        <UButton v-else size="xl" block @click="retry">Intentar de nuevo</UButton>
        <UButton to="/" size="xl" variant="ghost" color="neutral" block>Ir al inicio</UButton>
      </div>
    </main>
  </div>
</template>
