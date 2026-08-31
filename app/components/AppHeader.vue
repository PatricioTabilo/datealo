<script setup lang="ts">
</script>

<template>
  <header class="border-b border-datealo-surface bg-datealo-bg">
    <div class="container mx-auto flex items-center justify-between px-5 py-4 sm:px-8">
      <UButton
        to="/"
        variant="link"
        color="neutral"
        class="p-0 text-2xl font-extrabold tracking-tight hover:bg-transparent"
      >
        <span class="text-datealo-text">datea</span><span class="text-secondary">lo</span>
      </UButton>
      <UButton to="/buscar" variant="link" color="neutral" class="text-sm font-bold text-datealo-text hover:text-primary">
        Buscar
      </UButton>
    </div>
  </header>
</template>
