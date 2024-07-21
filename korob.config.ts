import { defineConfig } from "korob";

export default defineConfig({
  diagnostics: {
    biome: {
      linter: {
        rules: {
          correctness: {
            noUndeclaredVariables: "off",
            noUnusedVariables: "off",
            useHookAtTopLevel: "off",
          },
        },
      },
    },
  },
});
