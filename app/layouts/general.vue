<template>
  <div class="flex min-h-screen flex-col">
    <AppHeader />
    <div class="flex-1">
      <slot />
    </div>
    <AppFooter class="pb-24 lg:pb-0" />
  </div>
</template>
