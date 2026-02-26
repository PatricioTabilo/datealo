<script setup lang="ts">
const scrolled = ref(false)

const onScroll = () => {
  scrolled.value = window.scrollY > 20
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))

const scrollToSection = (selector: string) => {
  const target = document.querySelector(selector)
  const nav = document.querySelector('nav')
  if (!target) return

  const navHeight = nav instanceof HTMLElement ? nav.offsetHeight : 0
  const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight - 12

  window.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' })
}

const goToTop = () => {
  window.scrollTo({ top: 0, behavior: 'auto' })
}
</script>

<template>
  <nav
    class="fixed top-0 w-full z-50 transition-all duration-300"
    :class="scrolled ? 'bg-primary/95 backdrop-blur-xl shadow-lg shadow-primary-content/[0.05] border-b border-white/10 py-2' : 'bg-transparent py-4'"
  >
    <div class="container mx-auto px-5 sm:px-8 flex items-center justify-between">
      <!-- Logo -->
      <button type="button" class="group flex items-baseline gap-0 text-3xl font-extrabold tracking-tight" @click="goToTop">
        <span class="text-white">datea</span>
        <span class="text-secondary">lo</span>
      </button>

      <div class="flex items-center gap-2 sm:gap-4">
        <!-- Nav links -->
        <button
          class="nav-link hidden sm:inline-flex items-center px-3.5 py-2 text-sm font-semibold text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-all duration-200"
          @click="scrollToSection('#categorias')"
        >
          Categorías
        </button>
        <button
          class="nav-link hidden sm:inline-flex items-center px-3.5 py-2 text-sm font-semibold text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-all duration-200"
          @click="scrollToSection('#profesionales')"
        >
          Para profesionales
        </button>

        <!-- CTA -->
        <button
          class="inline-flex items-center h-10 px-5 rounded-xl text-sm font-bold text-primary bg-white shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer"
          @click="scrollToSection('#hero-form')"
        >
          Acceso anticipado
        </button>
      </div>
    </div>
  </nav>
</template>
