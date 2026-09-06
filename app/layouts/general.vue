<template>
  <div class="flex min-h-screen flex-col">
    <AppHeader />
    <div class="flex-1">
      <slot />
    </div>
    <AppFooter class="pb-[var(--contact-bar-h,_6rem)] lg:pb-0" />
  </div>
</template>
