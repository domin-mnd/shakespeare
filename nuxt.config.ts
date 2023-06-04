import { resolvePath } from '@nuxt/kit';

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
});
