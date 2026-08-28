<script setup lang="ts">
definePageMeta({ middleware: 'profesional' })

useSeoMeta({ title: 'Crea tu perfil', robots: 'noindex' })

const { data: user } = await useFetch('/api/auth/me')
</script>

<template>
  <div class="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10 text-center">
    <h1 class="text-2xl font-extrabold text-datealo-text">Crea tu perfil</h1>
    <p class="mt-2 text-sm text-datealo-muted">
      Sesión iniciada como <strong class="text-datealo-text">{{ user?.email }}</strong>. El formulario de
      registro llega en el próximo paso.
    </p>
  </div>
</template>
