import { defineConfig } from "tsdown"

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "group/index": "src/group/index.ts",
    "i18n/index": "src/i18n/index.ts",
    "media/index": "src/media/index.ts",
    "step/index": "src/step/index.ts",
  },
  format: ["esm"],
  // No sourcemaps in the published package: they doubled the size of dist/
  // and pointed to src/, which is not published. The dts plugin would turn
  // them back on because tsconfig.json sets `declarationMap`.
  dts: { sourcemap: false },
  sourcemap: false,
  clean: true,
  target: "es2022",
  // react/react-dom come from the host application; everything else
  // (base-ui, tiptap, lucide…) is declared in dependencies and externalised.
  external: [
    "react",
    "react-dom",
    "react/jsx-runtime",
    "react-mini-i18n",
    "jsonld-item",
    "resource-registry",
  ],
  platform: "browser",
  // Keeps the components usable on the client inside an RSC context.
  outputOptions: {
    banner: '"use client";',
  },
})
