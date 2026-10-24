import { readdirSync, readFileSync } from "node:fs"
import { join, relative } from "node:path"
import { describe, expect, it } from "vitest"

const root = join(process.cwd(), "src")

// The media module labels are handled on their own (MediaObjectPort labels),
// and the French dictionary is French by design.
const skipped = [join(root, "media"), join(root, "i18n", "fr.ts")]

// Accented letters, or words no English label carries.
const french =
  /[àâçéèêëîïôûùüÿœ]|\b(le|la|les|des|du|une|votre|vos|pour|avec|cette|ce|mot|jour|heures?|fermer|annuler|ajouter|enregistrer|supprimer|modifier|afficher|masquer|effacer|rechercher|valide|continuer|suivant|précédent)\b/i

function sourceFiles(dir: string): string[] {
  if (skipped.includes(dir)) return []

  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return sourceFiles(path)
    if (!/\.tsx?$/.test(entry.name) || /\.test\.tsx?$/.test(entry.name)) return []
    return skipped.includes(path) ? [] : [path]
  })
}

function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:"'`\\])\/\/.*$/gm, "$1")
}

// String literals and JSX text: what can end up on screen.
function texts(source: string): string[] {
  const literals = source.match(/"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`[^`]*`/g)
  const jsxText = source.match(/>[^<>{}]*[A-Za-zÀ-ÿ][^<>{}]*</g)
  return [...(literals ?? []), ...(jsxText ?? [])]
}

describe("src/", () => {
  // Every label goes through translate with an English key: a French literal
  // can't be translated into anything else, and reads wrong in every app.
  it("holds no French string outside comments", () => {
    const found = sourceFiles(root).flatMap((path) =>
      texts(stripComments(readFileSync(path, "utf8")))
        .filter((text) => french.test(text))
        .map((text) => `${relative(root, path)}: ${text.trim()}`)
    )

    expect(found).toEqual([])
  })
})
