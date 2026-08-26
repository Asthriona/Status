export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  modules: ['@nuxtjs/tailwindcss'],

  runtimeConfig: {
    mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/monit',
    jwtSecret: process.env.JWT_SECRET || 'change-me-in-production',
    public: {
      orgId: process.env.DEFAULT_ORG_ID || 'default',
    },
  },

  nitro: {
    experimental: {
      websocket: true,
    },
  },

  tailwindcss: {
    configPath: 'tailwind.config.ts',
  },

  app: {
    baseURL: process.env.APP_BASE_URL || '/',
    head: {
      title: 'Asthriona Status',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
    },
  },

  typescript: {
    strict: true,
  },
})
