<script setup lang="ts">
import { Mail, TriangleAlert } from '@lucide/vue'

definePageMeta({ middleware: 'profesional', layout: 'general' })

useSeoMeta({ title: 'Entra a Datealo', robots: 'noindex' })

const { step, email, emailError, sendError, loading, resendHintVisible, sendLink, startOver } = useMagicLink()
</script>

<template>
  <div class="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10">
    <template v-if="step === 'email'">
      <h1 class="text-2xl font-extrabold text-datealo-text">Entra a Datealo</h1>
      <p class="mt-2 text-sm text-datealo-muted">
        Te mandamos un enlace a tu correo, sin contraseña que recordar.
      </p>

      <form class="mt-8" novalidate @submit.prevent="sendLink">
        <label for="magic-link-email" class="mb-2 block text-sm font-semibold text-datealo-text">
          Tu email
        </label>
        <UInput
          id="magic-link-email"
          v-model="email"
          type="email"
          autocomplete="email"
          placeholder="hector@gmail.com"
          size="lg"
          class="w-full"
          :disabled="loading"
          :color="emailError ? 'error' : 'primary'"
          :highlight="Boolean(emailError)"
          :aria-describedby="emailError ? 'magic-link-email-error' : undefined"
        />
        <p
          v-if="emailError"
          id="magic-link-email-error"
          class="mt-2 text-xs font-semibold text-error"
          aria-live="polite"
        >
          {{ emailError }}
        </p>

        <UButton type="submit" block size="lg" class="mt-6 font-bold" :loading="loading" :disabled="loading">
          <template v-if="!loading">Enviar enlace</template>
        </UButton>
        <p v-if="sendError" class="mt-2 text-xs font-semibold text-error" aria-live="polite">
          {{ sendError }}
        </p>
      </form>
    </template>

    <template v-else-if="step === 'revisa-correo'">
      <div class="flex flex-col items-center text-center">
        <div class="flex h-16 w-16 items-center justify-center rounded-full bg-datealo-surface">
          <Mail class="h-7 w-7 text-primary" />
        </div>
        <h1 class="mt-6 text-xl font-extrabold text-datealo-text">Revisa tu correo</h1>
        <p class="mt-3 text-sm text-datealo-muted">
          Te mandamos un enlace a<br />
          <strong class="text-datealo-text">{{ email }}</strong>. Tócalo para entrar.
        </p>
        <p v-if="resendHintVisible" class="mt-10 text-xs text-datealo-muted" aria-live="polite">
          ¿No te llegó? Revisa spam o
          <button
            type="button"
            class="font-semibold text-primary underline disabled:opacity-50"
            :disabled="loading"
            @click="sendLink"
          >
            {{ loading ? 'enviando…' : 'pide otro enlace' }}
          </button>
        </p>
        <p v-if="sendError" class="mt-2 text-xs font-semibold text-error" aria-live="polite">
          {{ sendError }}
        </p>
      </div>
    </template>

    <template v-else>
      <div class="flex flex-col items-center text-center">
        <div class="flex h-16 w-16 items-center justify-center rounded-full bg-datealo-surface">
          <TriangleAlert class="h-7 w-7 text-error" />
        </div>
        <h1 class="mt-6 text-xl font-extrabold text-datealo-text">Este enlace ya no funciona</h1>
        <p class="mt-3 text-sm text-datealo-muted">
          Puede que ya lo hayas usado, o que hayan pasado más de 60 minutos desde que lo pediste.
        </p>
        <UButton size="lg" block class="mt-8 font-bold" @click="startOver">Enviar uno nuevo</UButton>
      </div>
    </template>
  </div>
</template>
