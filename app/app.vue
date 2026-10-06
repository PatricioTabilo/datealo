<script setup lang="ts">
// Valores por defecto para cuando alguien comparte cualquier link de Datealo; cada página puede pisarlos.
// og:image exige una URL absoluta, por eso se arma con el origen de la request (sirve igual en
// producción, en los previews de Vercel y en local).
useSeoMeta({
  ogImage: `${useRequestURL().origin}/og-image.png`,
  twitterCard: 'summary_large_image',
  ogSiteName: 'datealo',
  ogLocale: 'es_CL',
})
</script>

<template>
  <UApp :toaster="{ position: 'bottom-right' }">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
