// Checks the built package after `pnpm run build`: no published entry point may
// statically reach a chunk that is meant to be loaded on demand. The emoji
// dataset (`emojiData`) is only pulled by `getEmojiValueOptions` through a
// dynamic `import()`; a static import from an entry would put it back in the
// initial bundle of every app.
import { existsSync, readFileSync } from "node:fs"
import { dirname, join, relative, resolve } from "node:path"
import process from "node:process"

const root = resolve(import.meta.dirname, "..")
const dist = join(root, "dist")
const lazyChunks = [/(^|\/)emojiData-[^/]*\.js$/]

// `import … from "./x.js"`, `export … from "./x.js"` and `import "./x.js"`;
// dynamic `import("./x.js")` does not match.
const staticImport =
  /^\s*(?:(?:import|export)\b[^;]*?\bfrom\s*|import\s*)["'](\.{1,2}\/[^"']+)["']/gm

const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"))
const entries = Object.values(pkg.exports)
  .map((target) => target?.import)
  .filter(Boolean)
  .map((file) => resolve(root, file))

const errors = []

for (const entry of entries) {
  if (!existsSync(entry)) {
    errors.push(`${relative(root, entry)} is missing, run \`pnpm run build\` first`)
    continue
  }

  const seen = new Set()
  const walk = (file, chain) => {
    if (seen.has(file)) return
    seen.add(file)

    const name = relative(dist, file)
    if (lazyChunks.some((pattern) => pattern.test(name))) {
      errors.push(`${chain.join(" -> ")} -> ${name} is imported statically`)
      return
    }

    for (const [, specifier] of readFileSync(file, "utf8").matchAll(staticImport)) {
      walk(resolve(dirname(file), specifier), [...chain, name])
    }
  }

  walk(entry, [])
}

if (errors.length > 0) {
  process.stderr.write(
    `check-dist failed:\n${errors.map((e) => `  ${e}\n`).join("")}`
  )
  process.exitCode = 1
} else {
  process.stdout.write(
    `check-dist: ${entries.length} entry points, no lazy chunk imported statically\n`
  )
}
