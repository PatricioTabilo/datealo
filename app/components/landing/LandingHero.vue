<script setup lang="ts">
import { CheckCircle, Star } from '@lucide/vue'
import { LANDING_HERO } from '~/constants/landing'

const categoriaSlug = ref<string | null>(null)
const comunaCodigo = ref<string | null>(null)

const searchQuery = computed(() => {
  const query: Record<string, string> = {}
  if (categoriaSlug.value) query.categoria = categoriaSlug.value
  if (comunaCodigo.value) query.comuna = comunaCodigo.value
  return query
})
</script>

<template>
  <section class="hero-section relative overflow-hidden bg-primary pt-32 pb-20 lg:pt-40 lg:pb-32">
    <!-- Decorative background elements -->
    <div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
      <div class="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-white/5 blur-3xl" />
      <div class="absolute bottom-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-secondary/10 blur-3xl" />
      <!-- Grid pattern overlay -->
      <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjEpIi8+PC9zdmc+')] opacity-50"></div>
    </div>

    <div class="container relative z-10 mx-auto px-5 sm:px-8">
      <div class="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <!-- Text Content -->
        <div class="max-w-2xl">
          <h1 class="text-4xl sm:text-5xl lg:text-[4rem] font-extrabold leading-[1.1] text-white mb-6 tracking-tight">
            {{ LANDING_HERO.headline }}
            <span class="text-secondary block mt-2">{{ LANDING_HERO.headlineAccent }}</span>
          </h1>

          <p class="text-lg sm:text-xl text-white/80 mb-10 leading-relaxed max-w-lg font-medium">
            {{ LANDING_HERO.subheadline }}
          </p>

          <!-- Buscador -->
          <div class="bg-white p-3 rounded-2xl shadow-2xl shadow-black/20 max-w-lg relative z-20">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div class="flex-1">
                <label for="hero-categoria" class="mb-1 block text-[0.625rem] font-bold uppercase tracking-wide text-datealo-text/50">
                  Categoría
                </label>
                <CategoriaSelect id="hero-categoria" v-model="categoriaSlug" />
              </div>
              <div class="flex-1">
                <label for="hero-comuna" class="mb-1 block text-[0.625rem] font-bold uppercase tracking-wide text-datealo-text/50">
                  Comuna
                </label>
                <ComunaSelect id="hero-comuna" v-model="comunaCodigo" />
              </div>
              <UButton
                :to="{ path: '/buscar', query: searchQuery }"
                variant="link"
                color="neutral"
                class="h-14 rounded-xl px-7 text-sm font-bold bg-secondary text-white hover:bg-secondary/90 hover:text-white active:text-white hover:scale-[1.02] shadow-lg shadow-secondary/20 transition-all"
              >
                {{ LANDING_HERO.cta }}
              </UButton>
            </div>
          </div>

          <ul class="flex flex-wrap items-center gap-x-6 gap-y-3 mt-8 text-sm text-white/80 font-semibold">
            <li v-for="item in LANDING_HERO.trust" :key="item" class="flex items-center gap-2">
              <CheckCircle class="w-4 h-4 text-secondary" />
              {{ item }}
            </li>
          </ul>
        </div>

        <!-- Image Content -->
        <div class="relative lg:h-[600px] w-full rounded-[2.5rem] shadow-2xl shadow-black/40 border-4 border-white/10 transform lg:rotate-2 hover:rotate-0 transition-transform duration-500 group">
          <div class="absolute inset-0 rounded-[2.5rem] overflow-hidden">
            <img
              :src="LANDING_HERO.heroImage.src"
              :alt="LANDING_HERO.heroImage.alt"
              class="w-full h-full object-cover object-[65%_20%] group-hover:scale-105 transition-transform duration-700"
              loading="eager"
            />
          </div>
          <!-- Playful overlay badge -->
          <div class="absolute bottom-6 left-6 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl hidden md:flex items-center gap-4 transform -rotate-3 border border-white z-10">
            <div class="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl shadow-inner">
              <Star class="w-6 h-6 fill-current" />
            </div>
            <div>
              <p class="text-sm font-extrabold text-datealo-text leading-tight">Profesionales<br>verificados</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
