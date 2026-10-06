<script setup lang="ts">
useSeoMeta({
  title: 'datealo · Encuentra al profesional que necesitas, cerca de ti',
  description: 'Gasfitería, electricidad, peluquería, limpieza y más. Busca por categoría y comuna, mira reseñas reales y contacta directo por WhatsApp o teléfono. Gratis y sin registro.',
  ogTitle: 'datealo · Profesionales cerca de ti, con reseñas reales',
  ogDescription: 'Busca por categoría y comuna, mira reseñas reales y contacta directo por WhatsApp o teléfono. Gratis y sin registro.',
  ogType: 'website',
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
        description: 'Buscador de profesionales con reseñas reales para el hogar y la vida diaria.',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://datealo.cl/buscar?categoria={search_term_string}',
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
