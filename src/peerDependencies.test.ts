import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

const manifest = JSON.parse(
  readFileSync(join(process.cwd(), "package.json"), "utf8")
)

describe("peerDependencies", () => {
  // In 0.x a caret pins the minor: `^0.1.0` ruled out react-mini-i18n 0.2.0,
  // and npm stopped on ERESOLVE as soon as an app installed it.
  it("accepts the current react-mini-i18n release", () => {
    const ranges = manifest.peerDependencies["react-mini-i18n"]
      .split("||")
      .map((range: string) => range.trim())

    expect(ranges).toContain("^0.2.0")
  })

  // The core reads its contexts with `use()` and renders them as their own
  // provider, and the `src/ui/` components take `ref` as a plain prop: all three
  // are React 19. Under 18.3 the first render threw "use is not a function".
  it.each(["react", "react-dom"])("only accepts React 19 for %s", (name) => {
    expect(manifest.peerDependencies[name]).toBe("^19.0.0")
  })
})
