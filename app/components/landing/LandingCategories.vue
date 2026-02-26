<script setup lang="ts">
import {
  ChevronLeft, ChevronRight
} from 'lucide-vue-next'
import { LANDING_CATEGORIES } from '~/constants/landing'

const scrollContainer = ref<HTMLElement | null>(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(true)

const checkScroll = () => {
  const el = scrollContainer.value
  if (!el) return
  canScrollLeft.value = el.scrollLeft > 10
  canScrollRight.value = el.scrollLeft < el.scrollWidth - el.clientWidth - 10
}

const scroll = (direction: 'left' | 'right') => {
  const el = scrollContainer.value
  if (!el) return
  const cardWidth = el.querySelector('.carousel-card')?.clientWidth ?? 320
  const gap = 24
  const amount = (cardWidth + gap) * 2
  el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' })
}

onMounted(() => {
  scrollContainer.value?.addEventListener('scroll', checkScroll, { passive: true })
  checkScroll()
})

onUnmounted(() => {
  scrollContainer.value?.removeEventListener('scroll', checkScroll)
})
</script>

<template>
  <section id="categorias" class="py-24 sm:py-32 bg-base-100">
    <div class="container mx-auto px-5 sm:px-8">
      <!-- Header with nav arrows -->
      <div class="flex items-end justify-between mb-12 sm:mb-16">
        <div class="max-w-xl">
          <h2 class="text-4xl sm:text-5xl font-extrabold text-base-content tracking-tight leading-tight">
            {{ LANDING_CATEGORIES.title }}
          </h2>
        </div>

        <!-- Navigation arrows (desktop only) -->
        <div class="hidden sm:flex items-center gap-3">
          <button
            class="h-12 w-12 rounded-full border-2 border-base-300 flex items-center justify-center transition-all duration-200 cursor-pointer"
            :class="canScrollLeft ? 'hover:border-primary hover:bg-primary hover:text-white text-base-content' : 'opacity-30 cursor-not-allowed text-base-content/40'"
            :disabled="!canScrollLeft"
            aria-label="Anterior"
            @click="scroll('left')"
          >
            <ChevronLeft class="w-5 h-5" />
          </button>
          <button
            class="h-12 w-12 rounded-full border-2 border-base-300 flex items-center justify-center transition-all duration-200 cursor-pointer"
            :class="canScrollRight ? 'hover:border-primary hover:bg-primary hover:text-white text-base-content' : 'opacity-30 cursor-not-allowed text-base-content/40'"
            :disabled="!canScrollRight"
            aria-label="Siguiente"
            @click="scroll('right')"
          >
            <ChevronRight class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>

    <div class="container mx-auto px-5 sm:px-8">
      <!-- Carousel — Apple Cards style -->
      <div
        ref="scrollContainer"
        class="flex gap-5 sm:gap-7 overflow-x-auto scroll-smooth pb-5 pr-5 sm:pr-8 snap-x snap-mandatory scrollbar-hide"
      >
        <a
          v-for="cat in LANDING_CATEGORIES.items"
          :key="cat.name"
          href="#hero-form"
          class="carousel-card group relative shrink-0 w-[300px] sm:w-[410px] rounded-[2.2rem] overflow-hidden aspect-[3/4] snap-start shadow-sm shadow-base-content/[0.08] text-left"
          :aria-label="cat.query"
        >
          <img
            :src="cat.image"
            :alt="cat.name"
            class="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
            loading="lazy"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/30 via-black/5 to-black/50" />

          <div class="absolute top-8 left-8 right-8">
            <p class="text-white/75 text-[0.95rem] font-medium mb-2.5 tracking-tight">{{ cat.name }}</p>
            <h3 class="text-white text-[2rem] sm:text-[2.2rem] leading-[1.06] font-semibold tracking-[-0.02em]">{{ cat.query }}</h3>
          </div>
        </a>
      </div>
    </div>

    <div class="container mx-auto px-5 sm:px-8">
      <p class="text-base-content/50 text-sm mt-10 font-medium">
        {{ LANDING_CATEGORIES.subtitle }}
      </p>
    </div>
  </section>
</template>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
