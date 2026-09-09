<script setup lang="ts">
import { Hourglass, SearchX, Star } from '@lucide/vue'
import type { PublicReview } from '~/types/review'

definePageMeta({ layout: 'general' })

const route = useRoute()
const id = route.params.id as string

const { professional, pending, notFound, slow, refresh, updateProfessional } = usePublicProfessionalProfile(id)

const memberSince = computed(() => professional.value ? formatMemberSince(professional.value.createdAt) : '')

// La categoría de la búsqueda que trajo al usuario llega por query (?categoria=slug); un link directo la
// omite, y entonces resolveCategoriaContext cae a la primera categoría declarada.
const contextSlug = computed(() => {
  const raw = route.query.categoria
  return typeof raw === 'string' ? raw : undefined
})

const categoriaContext = computed(() => professional.value
  ? resolveCategoriaContext(professional.value.categorias, contextSlug.value)
  : null)

const contactBarRef = useTemplateRef('contactBar')
useContactBarHeight(contactBarRef)

function onReviewPublished(review: PublicReview) {
  if (!professional.value) return
  const reviews = upsertLocalReview(professional.value.reviews, review)
  updateProfessional({ reviews, ratingAverage: averageRating(reviews), reviewCount: reviews.length })
}

useSeoMeta({
  title: () => professional.value && categoriaContext.value
    ? `${professional.value.displayName} · ${categoriaContext.value.categoria.nombre} en ${professional.value.comunaNombre}`
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
    <div v-else-if="pending" class="mx-auto max-w-5xl lg:grid lg:grid-cols-[55fr_45fr] lg:items-start lg:gap-8 lg:px-8 lg:py-8" aria-busy="true">
      <div>
        <div class="aspect-4/3 w-full animate-pulse bg-datealo-surface lg:rounded-2xl" />
        <div class="space-y-2.5 px-5 pt-4 lg:px-0">
          <div class="h-6 w-48 animate-pulse rounded bg-datealo-surface" />
          <div class="h-4 w-32 animate-pulse rounded bg-datealo-surface" />
          <div class="mt-1.5 h-5 w-28 animate-pulse rounded bg-datealo-surface" />
        </div>
      </div>
      <div class="mx-5 mt-4 h-12 animate-pulse rounded-xl bg-datealo-surface lg:mx-0 lg:mt-0 lg:h-44 lg:rounded-2xl" />
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
    <div v-else-if="professional" class="mx-auto max-w-5xl lg:grid lg:grid-cols-[55fr_45fr] lg:items-start lg:gap-8 lg:px-8 lg:py-8">
      <!-- Columna principal: galería + identidad + precio + descripción -->
      <div>
        <ProfessionalPublicPhotos
          :photo-urls="professional.photoUrls"
          :display-name="professional.displayName"
          :avatar-url="professional.avatarUrl"
        />

        <div class="px-5 pt-4 lg:px-0">
          <h1 class="text-xl font-extrabold text-datealo-text lg:text-2xl">{{ professional.displayName }}</h1>
          <p class="mt-0.5 text-sm text-datealo-muted">{{ categoriaContext?.categoria.nombre }} · {{ professional.comunaNombre }}</p>

          <p v-if="categoriaContext?.categoria.priceFrom" class="mt-2 text-base font-bold text-datealo-text lg:text-lg">
            Desde ${{ formatPriceFrom(categoriaContext.categoria.priceFrom) }}
          </p>

          <p v-if="categoriaContext?.categoria.description" class="mt-4 text-base leading-relaxed text-datealo-text">
            {{ categoriaContext.categoria.description }}
          </p>

          <!-- En mobile va debajo de la descripción, antes de las reseñas; el equivalente de desktop vive
               en la barra lateral (más abajo), no acá. -->
          <ProfessionalPublicOtherCategorias
            v-if="categoriaContext && categoriaContext.secondary.length > 0"
            :categorias="categoriaContext.secondary"
            class="mt-5 lg:hidden"
          />
        </div>
      </div>

      <!-- El sticky sigue activo durante las reseñas porque este bloque ocupa dos filas del grid
           (row-span-2, la fila siguiente la usa ProfessionalPublicReviews con col-span-2) — sin el span,
           se despegaría al terminar esta columna. El borde/padding de tarjeta y el avatar+nombre+rating
           son solo de desktop: en mobile el bloque queda sin estilo propio, y su único hijo con presencia
           real es el CTA (fixed, fuera del flujo normal). El top usa --header-h (AppHeader, vía
           useHeaderHeight) en vez de un valor fijo: con top-8 a secas, el header (sticky, z-20, fondo
           opaco) tapaba el borde superior de la tarjeta apenas esta se volvía sticky. -->
      <div class="lg:sticky lg:top-[calc(var(--header-h,4.5rem)+2rem)] lg:row-span-2 lg:self-start lg:rounded-2xl lg:border lg:border-datealo-surface lg:p-6">
        <div class="hidden items-center gap-3 lg:flex">
          <img
            v-if="professional.photoUrls.length && professional.avatarUrl"
            :src="professional.avatarUrl"
            :alt="professional.displayName"
            class="h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-datealo-surface ring-offset-2 ring-offset-datealo-bg"
          >
          <div v-else class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-base font-extrabold text-white">
            {{ initials(professional.displayName) }}
          </div>
          <div>
            <p class="font-extrabold text-datealo-text">{{ professional.displayName }}</p>
            <div v-if="professional.ratingAverage !== null" class="mt-0.5 flex items-center gap-1 text-sm">
              <Star class="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span class="font-bold text-datealo-text">{{ professional.ratingAverage.toFixed(1).replace('.', ',') }}</span>
              <span class="text-datealo-muted">· {{ professional.reviewCount }} reseñas</span>
            </div>
          </div>
        </div>

        <!-- El mismo CTA sirve a ambos tamaños: fixed al fondo del viewport en mobile, inline dentro de
             la tarjeta en desktop — un solo componente, sin duplicar su lógica de contacto. -->
        <div
          ref="contactBar"
          class="fixed inset-x-0 bottom-0 z-10 border-t border-datealo-surface bg-datealo-bg p-4 lg:static lg:mt-5 lg:border-0 lg:bg-transparent lg:p-0"
        >
          <ProfessionalPublicContactBar
            :professional-id="professional.id"
            :contact="professional.contact"
            :display-name="professional.displayName"
            :categoria-nombre="categoriaContext?.categoria.nombre ?? ''"
          />
        </div>

        <ProfessionalPublicOtherCategorias
          v-if="categoriaContext && categoriaContext.secondary.length > 0"
          :categorias="categoriaContext.secondary"
          class="mt-5 hidden lg:block"
        />

        <p class="mt-3.5 hidden text-xs text-datealo-muted lg:block">En Datealo desde {{ memberSince }}</p>
      </div>

      <!-- Reseñas: ancho completo, fuera de ambas columnas -->
      <ProfessionalPublicReviews
        class="mt-8 px-5 lg:col-span-2 lg:mt-10 lg:px-0"
        :professional-id="professional.id"
        :display-name="professional.displayName"
        :categoria-nombre="categoriaContext?.categoria.nombre ?? ''"
        :reviews="professional.reviews"
        @published="onReviewPublished"
      />

      <!-- Mobile: "en Datealo desde" va después de las reseñas, no junto a la identidad — es el último
           elemento antes del footer, así que el buffer de AppFooter (useContactBarHeight) ya alcanza
           para que el CTA fijo no lo tape; no necesita su propio padding-bottom. -->
      <p class="mt-3 px-5 text-xs text-datealo-muted lg:hidden">En Datealo desde {{ memberSince }}</p>
    </div>
  </div>
</template>
