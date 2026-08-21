import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { fileURLToPath } from "node:url"

const src = fileURLToPath(new URL("../src", import.meta.url))

// The site consumes the library straight from source, so what you see on the
// page is what the current working tree does — no build step in between.
export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  base: process.env.DOCS_BASE ?? "/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      { find: /^react-data-form\/group$/, replacement: `${src}/group/index.ts` },
      { find: /^react-data-form\/media$/, replacement: `${src}/media/index.ts` },
      { find: /^react-data-form\/step$/, replacement: `${src}/step/index.ts` },
      { find: /^react-data-form$/, replacement: `${src}/index.ts` },
      { find: "@", replacement: src },
    ],
    dedupe: ["react", "react-dom"],
  },
  build: {
    outDir: fileURLToPath(new URL("./dist", import.meta.url)),
    emptyOutDir: true,
  },
})
