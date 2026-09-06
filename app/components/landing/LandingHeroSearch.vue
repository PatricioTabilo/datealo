<script setup lang="ts">
import { Search } from '@lucide/vue'

const categoriaSlug = ref<string | null>(null)
const comunaCodigo = ref<string | null>(null)
const shaking = ref(false)

const ready = computed(() => Boolean(categoriaSlug.value && comunaCodigo.value))

// El botón nunca bloquea el tap: navega con lo que esté elegido, igual que hoy. El shake es solo la señal
// del momento del tap cuando falta un campo — el color atenuado ya es la señal permanente por sí sola.
function handleSubmit() {
  if (!ready.value) {
    shaking.value = true
    setTimeout(() => { shaking.value = false }, 200)
  }

  const query: Record<string, string> = {}
  if (categoriaSlug.value) query.categoria = categoriaSlug.value
  if (comunaCodigo.value) query.comuna = comunaCodigo.value
  navigateTo({ path: '/buscar', query })
}
</script>

<template>
  <div class="relative z-20 max-w-xl">
    <!-- Mobile: cada campo es su propia tarjeta blanca con borde, separadas por espacio (no una línea
         divisora) — así se ve en el mockup validado, distinto del desktop porque ahí las dos van sueltas
         en columna, no lado a lado compartiendo una sola pill. -->
    <div class="flex flex-col gap-2 rounded-3xl bg-white p-2 shadow-2xl shadow-black/20 lg:hidden" :class="{ 'animate-shake': shaking }">
      <label for="hero-categoria-mobile" class="sr-only">Categoría</label>
      <CategoriaSelect
        id="hero-categoria-mobile"
        v-model="categoriaSlug"
        placeholder="¿Qué servicio buscas?"
        leading-icon="i-lucide-wrench"
        variant="outline"
        size="xl"
        :ui="{ base: 'rounded-2xl py-3.5 ps-11', leadingIcon: 'size-4 text-primary' }"
      />

      <label for="hero-comuna-mobile" class="sr-only">Comuna</label>
      <ComunaSelect
        id="hero-comuna-mobile"
        v-model="comunaCodigo"
        placeholder="¿Qué comuna buscas?"
        leading-icon="i-lucide-map-pin"
        variant="outline"
        size="xl"
        :ui="{ base: 'rounded-2xl py-3.5 ps-11', leadingIcon: 'size-4 text-primary' }"
      />

      <button
        type="button"
        class="flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-[0.9375rem] font-bold text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
        :class="ready ? 'bg-secondary shadow-lg shadow-secondary/30' : 'bg-secondary/50'"
        @click="handleSubmit"
      >
        <Search class="h-[18px] w-[18px]" :stroke-width="2.5" />
        Buscar
      </button>
    </div>

    <!-- Desktop: campos y botón en una fila, divisor vertical, placeholder corto para que quepa en una línea -->
    <div class="hidden items-center gap-1 rounded-full bg-white p-1.5 shadow-2xl shadow-black/20 lg:flex" :class="{ 'animate-shake': shaking }">
      <div class="flex-1">
        <label for="hero-categoria-desktop" class="sr-only">Categoría</label>
        <CategoriaSelect
          id="hero-categoria-desktop"
          v-model="categoriaSlug"
          placeholder="Elige categoría"
          leading-icon="i-lucide-wrench"
          variant="ghost"
          size="xl"
          :ui="{ base: 'rounded-full py-3.5', leadingIcon: 'size-4 text-primary' }"
        />
      </div>

      <div class="h-8 w-px shrink-0 bg-datealo-surface" />

      <div class="flex-1">
        <label for="hero-comuna-desktop" class="sr-only">Comuna</label>
        <ComunaSelect
          id="hero-comuna-desktop"
          v-model="comunaCodigo"
          placeholder="Elige comuna"
          leading-icon="i-lucide-map-pin"
          variant="ghost"
          size="xl"
          :ui="{ base: 'rounded-full py-3.5', leadingIcon: 'size-4 text-primary' }"
        />
      </div>

      <button
        type="button"
        aria-label="Buscar"
        class="flex shrink-0 items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
        :class="ready ? 'bg-secondary shadow-lg shadow-secondary/30 hover:bg-secondary/90' : 'bg-secondary/50'"
        @click="handleSubmit"
      >
        <Search class="h-4 w-4" :stroke-width="2.5" />
        Buscar
      </button>
    </div>
  </div>
</template>
