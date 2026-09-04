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

const { professional } = await useProfessionalSession()
const professionalLink = computed(() => professional.value ? '/profesional/perfil' : '/profesional/registro')
const professionalLabel = computed(() => professional.value ? 'Mi perfil' : 'Publícate')
</script>

<template>
  <nav
    class="fixed top-0 w-full z-50 transition-all duration-300"
    :class="scrolled ? 'bg-primary/95 backdrop-blur-xl shadow-lg shadow-primary-content/[0.05] border-b border-white/10 py-2' : 'bg-transparent py-4'"
  >
    <div class="container mx-auto flex items-center justify-between gap-3 px-5 sm:gap-4 sm:px-8">
      <!-- Logo -->
      <UButton
        variant="link"
        color="neutral"
        class="group flex shrink-0 items-baseline gap-0 p-0 text-3xl font-extrabold tracking-tight hover:bg-transparent"
        @click="goToTop"
      >
        <span class="text-white">datea</span>
        <span class="text-secondary">lo</span>
      </UButton>

      <!-- Tras scroll, el buscador grande del hero ya no está a la vista — el compacto lo reemplaza acá. -->
      <CompactSearchBar v-if="scrolled" class="min-w-0 flex-1 sm:flex-none" />
      <UButton
        v-else
        variant="link"
        color="neutral"
        class="nav-link hidden items-center rounded-lg px-3.5 py-2 text-sm font-semibold text-white/80 transition-all duration-200 hover:bg-white/10 hover:text-white active:text-white sm:inline-flex"
        @click="scrollToSection('#categorias')"
      >
        Categorías
      </UButton>

      <NuxtLink
        :to="professionalLink"
        class="shrink-0 rounded-lg px-3.5 py-2 text-sm font-semibold text-white/80 transition-all duration-200 hover:bg-white/10 hover:text-white"
      >
        {{ professionalLabel }}
      </NuxtLink>
    </div>
  </nav>
</template>
