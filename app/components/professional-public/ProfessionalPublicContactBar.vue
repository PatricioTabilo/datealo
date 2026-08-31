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

const { ensureToken } = useReviewToken(props.professionalId)

// sendBeacon, no fetch: dispara el registro antes de que el navegador salga hacia wa.me/tel:, sin
// esperar la respuesta ni arriesgar que un fetch en vuelo se cancele al abandonar la página — el
// contacto real nunca debe esperar a que este registro termine. El body va como Blob con
// application/json explícito: sendBeacon con un string a secas manda text/plain, y el servidor
// descarta el token en silencio sin ese content-type.
function registerContact() {
  const body = new Blob([JSON.stringify({ token: ensureToken() })], { type: 'application/json' })
  navigator.sendBeacon?.(`/api/professionals/${props.professionalId}/contacts`, body)
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
