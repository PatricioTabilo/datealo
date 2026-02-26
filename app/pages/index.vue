<script setup lang="ts">
useSeoMeta({
  title: 'datealo — Encuentra al profesional que necesitas, cerca de ti',
  description: 'Conectamos personas con profesionales verificados de su zona. Gasfitería, electricidad, peluquería, limpieza y más. Regístrate para acceso anticipado.',
  ogTitle: 'datealo — Profesionales verificados cerca de ti',
  ogDescription: 'Busca, compara y contacta profesionales de confianza en tu zona. Estamos por lanzar — únete a la lista de espera.',
  ogType: 'website',
  ogLocale: 'es_CL',
  ogSiteName: 'datealo',
})

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'datealo',
        url: 'https://datealo.cl',
        description: 'Buscador de profesionales verificados para el hogar y la vida diaria.',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://datealo.cl/buscar?q={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      }),
    },
  ],
})
</script>

<template>
  <div>
    <LandingNavbar />
    <LandingHero />
    <LandingProblem />
    <LandingSolution />
    <LandingCategories />
    <LandingForProfessionals />
    <LandingFinalCta />
    <LandingFooter />
  </div>
</template>
