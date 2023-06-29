// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  srcDir: "src/",
  pages: true,
  nitro: {
    /** @see {@link https://lucia-auth.com/start-here/getting-started?nuxt Polyfill crypto global} */
    moduleSideEffects: ["lucia-auth/polyfill/node"],
    preset: "vercel",
  },
  typescript: {
    strict: true,
  },
  modules: [
    // Helmet & rate limiting
    "nuxt-security",
    "@pinia/nuxt",
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
  build: {
    transpile: ["vue-remix-icons"],
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
  pinia: {
    autoImports: ["defineStore", "acceptHMRUpdate"],
  },
  imports: {
    dirs: ["./store"],
  },
  experimental: {
    payloadExtraction: false,
  },
});
