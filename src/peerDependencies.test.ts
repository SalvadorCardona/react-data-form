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
})
