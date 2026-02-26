<script setup lang="ts">
import { Loader2, CheckCircle, Star } from 'lucide-vue-next'
import { LANDING_HERO } from '~/constants/landing'

const { email, loading, submitted, error, submit } = useWaitlist('buscador')
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

          <!-- Email form -->
          <Transition name="fade" mode="out-in">
            <div
              v-if="submitted"
              class="flex items-center gap-3 rounded-2xl bg-success/20 border border-success/30 p-6 backdrop-blur-sm"
            >
              <CheckCircle class="h-8 w-8 text-success shrink-0" />
              <p class="text-white font-bold text-lg">¡Listo! Te avisaremos antes que a todos.</p>
            </div>

            <div v-else id="hero-form" class="bg-white p-2.5 rounded-2xl shadow-2xl shadow-black/20 max-w-lg relative z-20">
              <form class="flex flex-col sm:flex-row gap-2" @submit.prevent="submit">
                <div class="flex-1 relative">
                  <label for="hero-email" class="sr-only">Email</label>
                  <input
                    id="hero-email"
                    v-model="email"
                    type="email"
                    autocomplete="email"
                    :placeholder="LANDING_HERO.emailPlaceholder"
                    class="w-full h-14 rounded-xl bg-base-200/50 border-0 px-4 text-base text-base-content placeholder:text-base-content/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-base-200 transition-all"
                    :disabled="loading"
                  />
                  <p v-if="error" class="absolute -bottom-6 left-2 text-xs text-white bg-error/90 px-2 py-1 rounded">{{ error }}</p>
                </div>
                <button
                  type="submit"
                  class="btn h-14 rounded-xl px-7 text-sm font-bold bg-secondary text-white border-0 hover:bg-secondary/90 hover:scale-[1.02] shadow-lg shadow-secondary/20 transition-all"
                  :disabled="loading"
                >
                  <Loader2 v-if="loading" class="h-5 w-5 animate-spin" />
                  <template v-else>{{ LANDING_HERO.cta }}</template>
                </button>
              </form>
            </div>
          </Transition>

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
          <div class="absolute bottom-6 left-6 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl flex items-center gap-4 transform -rotate-3 border border-white z-10">
            <div class="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl shadow-inner">
              <Star class="w-6 h-6 fill-current" />
            </div>
            <div>
              <p class="text-sm font-extrabold text-base-content leading-tight">Profesionales<br>verificados</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
