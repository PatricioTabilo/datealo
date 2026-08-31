<script setup lang="ts">
import { Hourglass, SearchX, Star } from '@lucide/vue'
import type { PublicReview } from '~/types/review'

const route = useRoute()
const id = route.params.id as string

const { professional, pending, notFound, slow, refresh, updateProfessional } = usePublicProfessionalProfile(id)

const memberSince = computed(() => professional.value ? formatMemberSince(professional.value.createdAt) : '')

function onReviewPublished(review: PublicReview) {
  if (!professional.value) return
  const reviews = upsertLocalReview(professional.value.reviews, review)
  updateProfessional({ reviews, ratingAverage: averageRating(reviews), reviewCount: reviews.length })
}

useSeoMeta({
  title: () => professional.value
    ? `${professional.value.displayName} · ${professional.value.categoriaNombre} en ${professional.value.comunaNombre}`
    : 'Perfil de profesional',
})
</script>

<template>
  <div class="min-h-screen">
    <!-- tardando (>10s) -->
    <div v-if="slow" class="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <Hourglass class="h-10 w-10 text-datealo-muted" />
      <h1 class="text-lg font-extrabold text-datealo-text">Esto está tardando más de lo normal</h1>
      <UButton size="lg" @click="refresh()">Reintentar</UButton>
    </div>

    <!-- cargando -->
    <div v-else-if="pending" class="mx-auto max-w-5xl lg:flex lg:gap-8 lg:px-8 lg:py-8" aria-busy="true">
      <div class="aspect-4/3 w-full animate-pulse bg-datealo-surface lg:w-[55%] lg:rounded-2xl" />
      <div
        class="space-y-3 px-5 pt-5 lg:flex-1 lg:rounded-2xl lg:border lg:border-datealo-surface lg:px-6 lg:py-6"
      >
        <div class="h-6 w-48 animate-pulse rounded bg-datealo-surface" />
        <div class="h-4 w-32 animate-pulse rounded bg-datealo-surface" />
        <div class="h-4 w-full animate-pulse rounded bg-datealo-surface" />
        <div class="h-4 w-2/3 animate-pulse rounded bg-datealo-surface" />
      </div>
    </div>

    <!-- no encontrado -->
    <div v-else-if="notFound" class="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <SearchX class="h-10 w-10 text-datealo-muted" />
      <div>
        <h1 class="text-lg font-extrabold text-datealo-text">No encontramos este perfil</h1>
        <p class="mt-2 text-sm text-datealo-muted">Puede que ya no esté disponible o que el link esté mal escrito.</p>
      </div>
      <UButton to="/buscar" size="lg">Buscar profesionales</UButton>
    </div>

    <!-- encontrado -->
    <div v-else-if="professional" class="mx-auto max-w-5xl lg:flex lg:items-start lg:gap-8 lg:px-8 lg:py-8">
      <ProfessionalPublicPhotos
        :photo-urls="professional.photoUrls"
        :display-name="professional.displayName"
        class="lg:w-[55%]"
      />

      <div
        class="px-5 pb-28 pt-5 lg:flex-1 lg:sticky lg:top-8 lg:self-start lg:rounded-2xl lg:border lg:border-datealo-surface lg:p-6"
      >
        <h1 class="text-xl font-extrabold text-datealo-text lg:text-2xl">{{ professional.displayName }}</h1>
        <p class="mt-0.5 text-sm text-datealo-muted">{{ professional.categoriaNombre }} · {{ professional.comunaNombre }}</p>

        <div v-if="professional.ratingAverage !== null" class="mt-2 flex items-center gap-1 text-sm">
          <Star class="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span class="font-bold text-datealo-text">{{ professional.ratingAverage.toFixed(1).replace('.', ',') }}</span>
          <span class="text-datealo-muted">· {{ professional.reviewCount }} reseñas</span>
        </div>

        <p v-if="professional.description" class="mt-4 text-sm leading-relaxed text-datealo-text">
          {{ professional.description }}
        </p>

        <p v-if="professional.priceFrom" class="mt-3 text-base font-bold text-datealo-text lg:text-lg">
          Desde ${{ formatPriceFrom(professional.priceFrom) }}
        </p>

        <ProfessionalPublicReviews
          class="mt-6"
          :professional-id="professional.id"
          :display-name="professional.displayName"
          :categoria-nombre="professional.categoriaNombre"
          :reviews="professional.reviews"
          @published="onReviewPublished"
        />

        <p class="mt-3 text-xs text-datealo-muted">En Datealo desde {{ memberSince }}</p>

        <div
          class="fixed inset-x-0 bottom-0 z-10 border-t border-datealo-surface bg-datealo-bg p-4 lg:static lg:mt-8 lg:border-0 lg:bg-transparent lg:p-0"
        >
          <ProfessionalPublicContactBar
            :professional-id="professional.id"
            :contact="professional.contact"
            :display-name="professional.displayName"
            :categoria-nombre="professional.categoriaNombre"
          />
        </div>
      </div>
    </div>
  </div>
</template>
