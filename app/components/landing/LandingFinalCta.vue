<script setup lang="ts">
import { Loader2, CheckCircle } from '@lucide/vue'
import { LANDING_FINAL_CTA } from '~/constants/landing'

const { email, loading, submitted, error, submit } = useWaitlist('buscador')

const scrollToHero = () => {
  document.querySelector('#hero-form')?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <section class="py-24 sm:py-32 bg-datealo-surface">
    <div class="container mx-auto px-5 sm:px-8">
      <div class="max-w-3xl mx-auto text-center">
        <h2 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-datealo-text mb-6 tracking-tight leading-tight">
          {{ LANDING_FINAL_CTA.headline }}
          <span class="text-primary">{{ LANDING_FINAL_CTA.headlineAccent }}</span>
        </h2>

        <p class="text-lg sm:text-xl text-datealo-text/60 mb-12 leading-relaxed font-medium max-w-xl mx-auto">
          {{ LANDING_FINAL_CTA.subheadline }}
        </p>

        <UButton
          variant="solid"
          color="primary"
          class="h-14 rounded-xl px-10 text-base font-bold shadow-lg shadow-primary/20 hover:bg-primary active:bg-primary hover:shadow-xl hover:shadow-primary/30 transition-all"
          @click="scrollToHero"
        >
          {{ LANDING_FINAL_CTA.cta }}
        </UButton>

        <ul class="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 mt-8 text-sm text-datealo-text/50 font-semibold">
          <li v-for="item in LANDING_FINAL_CTA.trust" :key="item" class="flex items-center gap-2">
            <CheckCircle class="w-4 h-4 text-primary" />
            {{ item }}
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>
