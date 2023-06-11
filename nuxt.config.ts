import { resolvePath } from "@nuxt/kit";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  srcDir: "src/",
  nitro: {
    /** @see {@link https://lucia-auth.com/start-here/getting-started?nuxt Polyfill crypto global} */
    moduleSideEffects: ["lucia-auth/polyfill/node"],
  },
  typescript: {
    strict: true,
  },
  modules: [
    // Helmet & rate limiting
    "nuxt-security",
  ],
  security: {
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
});
