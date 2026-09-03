<script setup lang="ts">
const { professional } = useProfessionalSession()

const professionalLink = computed(() => professional.value ? '/profesional/perfil' : '/profesional/registro')
const professionalLabel = computed(() => professional.value ? 'Mi perfil' : 'Publícate en Datealo')
</script>

<template>
  <footer class="bg-primary px-5 py-6 lg:px-16 lg:py-12">
    <div class="lg:grid lg:grid-cols-5 lg:gap-8">
      <div class="mb-6 lg:mb-0">
        <p class="mb-1 font-heading text-xl font-extrabold lg:mb-2 lg:text-2xl">
          <span class="text-white">datea</span><span class="text-secondary">lo</span>
        </p>
        <p class="text-sm text-white/78">Encuentra al profesional que necesitas, cerca de ti.</p>
      </div>

      <div class="mb-5 border-t border-white/15 pt-5 lg:mb-0 lg:border-t-0 lg:pt-0">
        <p class="mb-2.5 font-heading text-[0.6875rem] font-bold uppercase tracking-wide text-white/80">Buscador</p>
        <NuxtLink
          to="/buscar"
          class="block rounded py-1.5 text-sm font-semibold text-white/95 hover:text-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
        >
          Buscar profesionales
        </NuxtLink>
      </div>

      <div class="mb-5 border-t border-white/15 pt-5 lg:mb-0 lg:border-t-0 lg:pt-0">
        <p class="mb-2.5 font-heading text-[0.6875rem] font-bold uppercase tracking-wide text-white/80">Profesionales</p>
        <NuxtLink
          :to="professionalLink"
          class="block rounded py-1.5 text-sm font-semibold text-white/95 hover:text-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
        >
          {{ professionalLabel }}
        </NuxtLink>
      </div>

      <div class="mb-5 border-t border-white/15 pt-5 lg:mb-0 lg:border-t-0 lg:pt-0">
        <p class="mb-2.5 font-heading text-[0.6875rem] font-bold uppercase tracking-wide text-white/80">Contacto</p>
        <p class="text-sm text-white/85">hola@datealo.cl</p>
        <p class="text-sm text-white/85">Santiago, Chile</p>
      </div>

      <div class="border-t border-white/15 pt-5 lg:border-t-0 lg:pt-0">
        <p class="mb-2.5 font-heading text-[0.6875rem] font-bold uppercase tracking-wide text-white/80">Legal</p>
        <NuxtLink
          to="/legal/terminos"
          class="block rounded py-1.5 text-sm font-semibold text-white/95 hover:text-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
        >
          Términos y Condiciones
        </NuxtLink>
        <NuxtLink
          to="/legal/privacidad"
          class="block rounded py-1.5 text-sm font-semibold text-white/95 hover:text-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
        >
          Política de Privacidad
        </NuxtLink>
      </div>
    </div>

    <div class="mt-6 border-t border-white/15 pt-5 text-center text-xs text-white/75 lg:mt-10 lg:pt-6">
      &copy; {{ new Date().getFullYear() }} datealo. Todos los derechos reservados.
    </div>
  </footer>
</template>
