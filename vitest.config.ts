import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import { fileURLToPath } from "node:url"

const src = fileURLToPath(new URL("./src", import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    // The site imports the library by its published name; the tests run before
    // `dist` exists, so the name is resolved to the source, as the site does.
    alias: [
      { find: /^react-data-form\/group$/, replacement: `${src}/group/index.ts` },
      { find: /^react-data-form\/i18n$/, replacement: `${src}/i18n/index.ts` },
      { find: /^react-data-form\/media$/, replacement: `${src}/media/index.ts` },
      { find: /^react-data-form\/step$/, replacement: `${src}/step/index.ts` },
      { find: /^react-data-form$/, replacement: `${src}/index.ts` },
      { find: "@", replacement: src },
    ],
    // `react-mini-i18n` is linked locally and ships its own copy of React;
    // without deduplication the hooks would run against two instances.
    dedupe: ["react", "react-dom"],
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    // The gallery tests render every controller (about 3 s here): the 5 s
    // default fails on a loaded CI runner without anything being broken.
    testTimeout: 30_000,
    // The documentation site lives in the repo and is tested with it.
    include: ["src/**/*.test.{ts,tsx}", "docs/**/*.test.{ts,tsx}"],
    // Type tests (`*.test-d.ts`): checked by tsc, not run.
    typecheck: { enabled: true, include: ["src/**/*.test-d.ts"] },
  },
})
