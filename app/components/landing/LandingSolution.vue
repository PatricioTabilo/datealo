<script setup lang="ts">
import { ShieldCheck, Star, MapPin, MessageCircle } from 'lucide-vue-next'
import { LANDING_SOLUTION } from '~/constants/landing'

const iconMap = { ShieldCheck, Star, MapPin, MessageCircle } as const
</script>

<template>
  <section class="py-24 sm:py-32 bg-base-200 relative overflow-hidden">
    <!-- Decorative background -->
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

    <div class="container mx-auto px-5 sm:px-8 relative z-10">
      <div class="max-w-2xl mx-auto text-center mb-16 sm:mb-20">
        <h2 class="text-4xl sm:text-5xl font-extrabold text-base-content mb-6 tracking-tight leading-tight">
          {{ LANDING_SOLUTION.title }}
        </h2>
        <p class="text-lg sm:text-xl text-base-content/60 leading-relaxed">
          {{ LANDING_SOLUTION.subtitle }}
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-6xl mx-auto">
        <div
          v-for="feature in LANDING_SOLUTION.features"
          :key="feature.title"
          class="group bg-white rounded-[2rem] p-8 text-center border border-base-200 shadow-lg shadow-base-content/[0.02] hover:shadow-xl hover:shadow-primary/10 transition-shadow duration-300 relative overflow-hidden"
        >
          <div class="relative mx-auto mb-6">
            <div class="h-20 w-20 rounded-[1.5rem] bg-primary/10 flex items-center justify-center mx-auto group-hover:bg-primary transition-colors duration-300">
              <component :is="iconMap[feature.icon]" class="h-8 w-8 text-primary group-hover:text-white transition-colors duration-300" />
            </div>
          </div>

          <h3 class="text-xl font-bold text-base-content mb-3 relative">
            {{ feature.title }}
          </h3>
          <p class="text-base text-base-content/60 leading-relaxed relative">
            {{ feature.description }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
