<script setup lang="ts">
import { Hourglass } from '@lucide/vue'

const route = useRoute()
const router = useRouter()

const categoriaSlug = ref(typeof route.query.categoria === 'string' ? route.query.categoria : null)
const comunaCodigo = ref(typeof route.query.comuna === 'string' ? route.query.comuna : null)

// Refleja la elección en la URL para que un link de búsqueda ya armado se pueda compartir — replace, no
// push, así cada cambio de selector no le agrega una entrada nueva al historial.
watch([categoriaSlug, comunaCodigo], ([categoria, comuna]) => {
  const query: Record<string, string> = {}
  if (categoria) query.categoria = categoria
  if (comuna) query.comuna = comuna
  router.replace({ query })
})

const { items: categorias } = useCategoriasCatalog()
const { items: comunas } = useComunasCatalog()
const categoriaNombre = computed(() => categorias.value.find(item => item.value === categoriaSlug.value)?.label ?? '')
const comunaNombre = computed(() => comunas.value.find(item => item.value === comunaCodigo.value)?.label ?? '')

const { ready, pending, error, slow, results, matchType, categoryHasResultsInChile, refresh } =
  useSearchResults(categoriaSlug, comunaCodigo)

const comunaSelect = useTemplateRef('comunaSelect')
watch(categoriaSlug, (value) => {
  if (value && !comunaCodigo.value) comunaSelect.value?.focus()
})

useSeoMeta({
  title: () => categoriaNombre.value && comunaNombre.value
    ? `${categoriaNombre.value} en ${comunaNombre.value}`
    : 'Buscar profesionales',
})
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <div class="sticky top-0 z-10 flex gap-2 border-b border-datealo-surface bg-datealo-bg p-3.5">
      <CategoriaSelect v-model="categoriaSlug" class="flex-1" />
      <ComunaSelect ref="comunaSelect" v-model="comunaCodigo" class="flex-1" />
    </div>

    <SearchEmptyState
      v-if="!ready"
      :title="categoriaSlug && !comunaCodigo ? 'Elige tu comuna' : 'Elige una categoría y tu comuna'"
      :subtitle="categoriaSlug && !comunaCodigo
        ? `para ver profesionales de ${categoriaNombre} cerca de ti`
        : 'para ver profesionales disponibles'"
    />

    <!-- tardando (>10s) -->
    <div v-else-if="slow" class="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <Hourglass class="h-10 w-10 text-datealo-muted" />
      <h1 class="text-base font-extrabold text-datealo-text">Esto está tardando más de lo normal</h1>
      <UButton size="lg" @click="refresh()">Reintentar</UButton>
    </div>

    <!-- cargando -->
    <div v-else-if="pending" class="flex flex-col gap-3 p-4" aria-busy="true">
      <div v-for="n in 4" :key="n" class="flex gap-3 rounded-2xl border border-datealo-surface p-3.5">
        <div class="h-12 w-12 shrink-0 animate-pulse rounded-full bg-datealo-surface" />
        <div class="flex-1 space-y-2">
          <div class="h-4 w-32 animate-pulse rounded bg-datealo-surface" />
          <div class="h-3 w-20 animate-pulse rounded bg-datealo-surface" />
          <div class="h-3 w-24 animate-pulse rounded bg-datealo-surface" />
        </div>
      </div>
    </div>

    <div v-else-if="error" class="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 class="text-base font-extrabold text-datealo-text">No pudimos cargar los resultados</h1>
      <UButton size="lg" @click="refresh()">Reintentar</UButton>
    </div>

    <!-- con resultados / comunas vecinas -->
    <div v-else-if="matchType === 'exacta' || matchType === 'vecina'" class="flex flex-col gap-3 p-4 lg:p-8">
      <template v-if="matchType === 'vecina'">
        <div class="rounded-xl bg-datealo-surface p-3.5 text-sm text-datealo-text">
          Todavía no hay profesionales de {{ categoriaNombre }} en {{ comunaNombre }}.
        </div>
        <p class="px-0.5 text-[0.6875rem] font-bold uppercase tracking-wide text-datealo-muted">
          Cerca de {{ comunaNombre }}
        </p>
      </template>
      <p v-else class="px-0.5 text-xs text-datealo-muted">
        {{ results.length }} {{ results.length === 1 ? 'resultado' : 'resultados' }}
      </p>

      <div class="flex flex-col gap-3 lg:grid lg:grid-cols-3 lg:gap-4">
        <SearchResultCard
          v-for="professional in results"
          :key="professional.id"
          :professional="professional"
          :vecina="matchType === 'vecina'"
        />
      </div>
    </div>

    <!-- sin resultados: la comuna y sus vecinas no tienen nada, pero la categoría existe en otra parte -->
    <SearchEmptyState
      v-else-if="matchType === 'ninguna' && categoryHasResultsInChile"
      :title="`Todavía no hay profesionales de ${categoriaNombre} cerca de ${comunaNombre}`"
      subtitle="Prueba con otra comuna."
    />

    <!-- sin resultados: la categoría no existe en ninguna comuna activa del país -->
    <SearchEmptyState
      v-else-if="matchType === 'ninguna'"
      :title="`Todavía no hay profesionales de ${categoriaNombre} en Datealo`"
      subtitle="Prueba con otra categoría."
    />
  </div>
</template>
