import { defineConfig } from "tsdown"

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "group/index": "src/group/index.ts",
    "media/index": "src/media/index.ts",
    "step/index": "src/step/index.ts",
  },
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  target: "es2022",
  // react/react-dom come from the host application; everything else
  // (base-ui, tiptap, lucide…) is declared in dependencies and externalised.
  external: ["react", "react-dom", "react/jsx-runtime", "react-mini-i18n", "jsonld-item", "resource-registry"],
  platform: "browser",
  // Keeps the components usable on the client inside an RSC context.
  outputOptions: {
    banner: '"use client";',
  },
})
