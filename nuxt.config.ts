// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  modules: ['@nuxt/ui'],

  devtools: { enabled: true },

  devServer: { port: 3001 },

  nitro: { preset: 'vercel' },

  runtimeConfig: {
    // Privado: solo servidor. Nunca llega al bundle del cliente (A-001).
    databaseUrl: '',

    public: {
      // Público por diseño: la publishable key no es un secreto (A-001).
      supabaseUrl: '',
      supabaseKey: '',
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'es-CL' },
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700;1,9..40,400&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap',
        },
      ],
    },
  },

  css: ['~/assets/css/main.css'],
})
