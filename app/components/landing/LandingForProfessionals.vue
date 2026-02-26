<script setup lang="ts">
import { Star, Loader2, CheckCircle, Check } from 'lucide-vue-next'
import { LANDING_FOR_PROFESSIONALS } from '~/constants/landing'

const { email, loading, submitted, error, submit } = useWaitlist('profesional')
</script>

<template>
  <section id="profesionales" class="py-24 sm:py-32 bg-primary relative overflow-hidden">
    <!-- Decorative background elements -->
    <div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
      <div class="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-white/5 blur-3xl" />
      <div class="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-secondary/10 blur-3xl" />
      <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjEpIi8+PC9zdmc+')] opacity-30"></div>
    </div>

    <div class="container mx-auto px-5 sm:px-8 relative z-10">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center max-w-6xl mx-auto">
        
        <!-- Left: copy + form -->
        <div class="order-2 lg:order-1">
          <h2 class="text-4xl sm:text-5xl font-extrabold text-white mb-6 tracking-tight leading-tight">
            {{ LANDING_FOR_PROFESSIONALS.headline }}
          </h2>

          <p class="text-lg sm:text-xl text-white/80 leading-relaxed mb-8 font-medium">
            {{ LANDING_FOR_PROFESSIONALS.agitate }}
          </p>

          <div class="bg-white/10 border border-white/20 rounded-2xl p-6 mb-10 backdrop-blur-sm">
            <p class="text-lg font-bold text-secondary mb-4">
              {{ LANDING_FOR_PROFESSIONALS.solution }}
            </p>
            <ul class="space-y-4">
              <li
                v-for="benefit in LANDING_FOR_PROFESSIONALS.benefits"
                :key="benefit.text"
                class="flex items-start gap-3"
              >
                <div class="h-6 w-6 rounded-full bg-secondary/20 text-secondary flex items-center justify-center shrink-0 mt-0.5">
                  <Check class="h-3.5 w-3.5" />
                </div>
                <span class="text-white/90 font-medium">{{ benefit.text }}</span>
              </li>
            </ul>
          </div>

          <!-- Inline form -->
          <div class="rounded-2xl bg-white p-3 shadow-2xl shadow-black/20">
            <p class="text-base-content/60 text-sm mb-3 px-2 font-medium">{{ LANDING_FOR_PROFESSIONALS.ctaContext }}</p>

            <Transition name="fade" mode="out-in">
              <div
                v-if="submitted"
                class="flex items-center gap-3 rounded-xl bg-success/10 border border-success/20 p-5"
              >
                <CheckCircle class="h-6 w-6 text-success shrink-0" />
                <p class="text-success font-bold">¡Registrado! Te contactaremos pronto.</p>
              </div>

              <form v-else class="flex flex-col sm:flex-row gap-2" @submit.prevent="submit">
                <div class="flex-1 min-w-0 relative">
                  <label for="pro-email" class="sr-only">Email profesional</label>
                  <input
                    id="pro-email"
                    v-model="email"
                    type="email"
                    autocomplete="email"
                    placeholder="Tu email"
                    class="w-full h-14 rounded-xl bg-base-200/50 border-0 px-4 text-base text-base-content placeholder:text-base-content/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-base-200 transition-all"
                    :disabled="loading"
                  />
                  <p v-if="error" class="absolute -bottom-6 left-2 text-xs text-error font-medium">{{ error }}</p>
                </div>
                <button
                  type="submit"
                  class="btn h-14 rounded-xl px-6 text-sm font-bold bg-secondary text-white border-0 hover:bg-secondary/90 shadow-lg shadow-secondary/20 transition-all shrink-0"
                  :disabled="loading"
                >
                  <Loader2 v-if="loading" class="h-5 w-5 animate-spin" />
                  <template v-else>{{ LANDING_FOR_PROFESSIONALS.cta }}</template>
                </button>
              </form>
            </Transition>
          </div>
        </div>

        <!-- Right: professional image (no animations) -->
        <div class="order-1 lg:order-2 relative">
          <div class="relative lg:h-[700px] w-full rounded-[2.5rem] shadow-2xl shadow-black/40 border-4 border-white/10 overflow-hidden">
            <img
              :src="LANDING_FOR_PROFESSIONALS.image.src"
              :alt="LANDING_FOR_PROFESSIONALS.image.alt"
              class="w-full h-full object-cover"
              loading="lazy"
            />
            <!-- Overlay badge -->
            <div class="absolute bottom-8 left-6 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl flex items-center gap-4 border border-white">
              <div class="flex -space-x-2">
                <div class="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center border-2 border-white z-30">
                  <Star class="w-5 h-5 text-amber-500 fill-amber-500" />
                </div>
                <div class="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center border-2 border-white z-20">
                  <Star class="w-5 h-5 text-amber-500 fill-amber-500" />
                </div>
                <div class="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center border-2 border-white z-10">
                  <Star class="w-5 h-5 text-amber-500 fill-amber-500" />
                </div>
              </div>
              <div>
                <p class="text-lg font-extrabold text-base-content leading-none">4.9/5</p>
                <p class="text-xs font-bold text-base-content/50 uppercase tracking-wider mt-1">+200 reseñas</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </section>
</template>
