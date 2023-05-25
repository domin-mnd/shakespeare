// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  srcDir: "src/",
  alias: {
    "$component": "/<rootDir>/components",
    "$auth": "/<rootDir>/server/utils/auth.ts",
  },
  nitro: {
    /** @see {@link https://lucia-auth.com/start-here/getting-started?nuxt Polyfill crypto global} */
		moduleSideEffects: ["lucia-auth/polyfill/node"]
	}
});
