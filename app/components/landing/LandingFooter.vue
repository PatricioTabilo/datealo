<template>
  <footer class="bg-datealo-text py-10 sm:py-14">
    <div class="container mx-auto px-5 sm:px-8">
      <div class="flex flex-col sm:flex-row items-center justify-between gap-6">
        <!-- Brand -->
        <div class="text-center sm:text-left">
          <p class="text-2xl font-extrabold font-heading mb-1">
            <span class="text-datealo-bg">datea</span><span class="text-secondary">lo</span>
          </p>
          <p class="text-sm text-datealo-bg/40">
            Encuentra al profesional que necesitas, cerca de ti.
          </p>
        </div>

        <!-- Contact -->
        <div class="text-center sm:text-right text-sm text-datealo-bg/40">
          <p>hola@datealo.cl</p>
          <p>Santiago, Chile</p>
        </div>
      </div>

      <div class="border-t border-datealo-bg/10 mt-8 pt-6 text-center text-xs text-datealo-bg/30">
        &copy; {{ new Date().getFullYear() }} datealo. Todos los derechos reservados.
      </div>
    </div>
  </footer>
</template>
