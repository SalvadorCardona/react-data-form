import { defineConfig } from "tsdown"

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "group/index": "src/group/index.ts",
    "media/index": "src/media/index.ts",
    "step/index": "src/step/index.ts",
    "i18n/index": "src/i18n/index.ts",
    "registry/index": "src/registry/index.ts",
  },
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  target: "es2022",
  // react/react-dom sont fournis par l'application hôte ; tout le reste
  // (base-ui, tiptap, lucide…) est déclaré en dependencies et donc externalisé.
  external: ["react", "react-dom", "react/jsx-runtime"],
  platform: "browser",
  // Les composants restent utilisables côté client dans un contexte RSC.
  outputOptions: {
    banner: '"use client";',
  },
})
