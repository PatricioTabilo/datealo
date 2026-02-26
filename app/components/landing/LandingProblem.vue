<script setup lang="ts">
import { MessageCircle, Clock, ShieldAlert, Globe } from 'lucide-vue-next'
import { LANDING_PROBLEM } from '~/constants/landing'

const iconMap = { MessageCircle, Clock, ShieldAlert, Globe } as const

const colorClasses: Record<string, string> = {
  red: 'bg-error/10 text-error border-error/20',
  amber: 'bg-amber-100 text-amber-600 border-amber-200',
  orange: 'bg-orange-100 text-orange-600 border-orange-200',
  slate: 'bg-base-200 text-base-content/60 border-base-300',
}
</script>

<template>
  <section class="py-24 sm:py-32 bg-base-100">
    <div class="container mx-auto px-5 sm:px-8">
      <div class="max-w-2xl mx-auto text-center mb-16 sm:mb-20">
        <h2 class="text-4xl sm:text-5xl font-extrabold text-base-content mb-6 tracking-tight leading-tight">
          {{ LANDING_PROBLEM.title }}
        </h2>
        <p class="text-lg sm:text-xl text-base-content/60 leading-relaxed">
          {{ LANDING_PROBLEM.subtitle }}
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
        <div
          v-for="item in LANDING_PROBLEM.items"
          :key="item.title"
          class="flex flex-col sm:flex-row gap-5 sm:gap-6 rounded-[2rem] bg-white border border-base-200 p-6 sm:p-8 shadow-lg shadow-base-content/[0.02] hover:shadow-xl hover:shadow-base-content/[0.04] transition-shadow duration-300"
        >
          <div
            class="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl flex items-center justify-center shrink-0 border"
            :class="colorClasses[item.color]"
          >
            <component :is="iconMap[item.icon]" class="h-6 w-6 sm:h-7 sm:w-7" />
          </div>
          <div>
            <h3 class="text-xl font-bold text-base-content mb-2">
              {{ item.title }}
            </h3>
            <p class="text-base text-base-content/60 leading-relaxed">
              {{ item.description }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
