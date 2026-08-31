<script setup lang="ts">
</script>

<template>
  <div class="flex min-h-screen flex-col bg-datealo-bg">
    <AppHeader />
    <div class="flex-1">
      <slot />
    </div>
    <AppFooter />
  </div>
</template>
