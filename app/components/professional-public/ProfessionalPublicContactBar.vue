<script setup lang="ts">
import { MessageCircle, Phone } from '@lucide/vue'

const props = defineProps<{
  professionalId: string
  contact: string
  displayName: string
  categoriaNombre: string
}>()

const message = buildContactMessage(props.displayName, props.categoriaNombre)
const whatsappUrl = computed(() => buildWhatsAppUrl(props.contact, message))
const telUrl = computed(() => buildTelUrl(props.contact))

// sendBeacon, no fetch: dispara el registro antes de que el navegador salga hacia wa.me/tel:, sin
// esperar la respuesta ni arriesgar que un fetch en vuelo se cancele al abandonar la página — el
// contacto real nunca debe esperar a que este registro termine.
function registerContact() {
  navigator.sendBeacon?.(`/api/professionals/${props.professionalId}/contacts`)
}
</script>

<template>
  <div class="flex gap-2">
    <UButton :to="whatsappUrl" size="lg" class="flex-1 justify-center font-bold" @click="registerContact">
      <MessageCircle class="h-5 w-5" />
      Escribir por WhatsApp
    </UButton>
    <UButton
      :to="telUrl"
      size="lg"
      variant="outline"
      color="neutral"
      class="px-4"
      aria-label="Llamar"
      @click="registerContact"
    >
      <Phone class="h-5 w-5" />
    </UButton>
  </div>
</template>
