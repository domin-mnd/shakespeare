// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  srcDir: "src/",
  pages: true,

  nitro: {
    preset: "vercel",
  },

  typescript: {
    strict: true,
  },

  modules: [
    // Helmet & rate limiting
    "nuxt-security",
  ],

  security: {
    headers: {
      xXSSProtection: "1",
      contentSecurityPolicy: false,
    },
    rateLimiter: {
      tokensPerInterval: 240,
      interval: "hour",
    },
    corsHandler: false,
  },

  routeRules: {
    "/api/files": {
      security: {
        xssValidator: false,
      },
    },
  },

  vite: {
    css: {
      preprocessorOptions: {
        // Alias doesn't work and idk why ¯\_(ツ)_/¯
        stylus: {
          additionalData: `@import "${__dirname}/src/assets/styles/theme/*.styl"`,
        },
      },
    },
  },

  app: {
    pageTransition: {
      name: "page",
      mode: "out-in",
    },
    layoutTransition: {
      name: "layout",
      mode: "out-in",
    },
  },

  experimental: {
    payloadExtraction: false,
  },

  compatibilityDate: "2024-07-22",
});
