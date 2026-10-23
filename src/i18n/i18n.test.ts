import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import { fr, translationKeys } from "@/i18n"

/** The library's own sources, tests left out: what ships is what counts. */
const root = join(process.cwd(), "src")
const sources: [string, string][] = readdirSync(root, { recursive: true })
  .map(String)
  .filter((path) => /\.tsx?$/.test(path) && !/\.test\.tsx?$/.test(path))
  .map((path) => [path, readFileSync(join(root, path), "utf8")])

/** Keys written as a literal: `translate("…")` or `<Trans>…</Trans>`. */
const literalKeys = sources.flatMap(([, code]) => [
  ...[...code.matchAll(/translate\(\s*"([^"]+)"/g)].map((match) => match[1]),
  ...[...code.matchAll(/<Trans[^>]*>([^<{]+)<\/Trans>/g)].map((match) =>
    match[1].trim()
  ),
])

describe("react-data-form/i18n", () => {
  it("lists each key once", () => {
    expect(new Set(translationKeys).size).toBe(translationKeys.length)
  })

  it("lists every key the components translate", () => {
    expect(literalKeys).toContain("Add a block")
    const missing = literalKeys.filter(
      (key) => !(translationKeys as readonly string[]).includes(key)
    )
    expect(missing).toEqual([])
  })

  it("lists no key the sources have dropped", () => {
    const stale = translationKeys.filter(
      (key: string) =>
        !sources.some(
          ([path, code]) =>
            !path.startsWith(join("i18n", "")) && code.includes(`"${key}"`)
        ) && !literalKeys.includes(key)
    )
    expect(stale).toEqual([])
  })

  it("translates exactly the keys of translationKeys into French", () => {
    expect(Object.keys(fr).sort()).toEqual([...translationKeys].sort())
    for (const key of translationKeys) expect(fr[key]).not.toBe("")
  })

  it("keeps the placeholders of each key in its French wording", () => {
    const placeholders = (text: string) => text.match(/\{\{\w+}}/g)?.sort() ?? []
    for (const key of translationKeys) {
      expect(placeholders(fr[key]), key).toEqual(placeholders(key))
    }
  })
})
