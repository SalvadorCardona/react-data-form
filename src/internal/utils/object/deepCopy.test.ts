import { describe, expect, it } from "vitest"
import { deepCopy } from "@/internal/utils/object/deepCopy"

describe("deepCopy", () => {
  it("retourne les valeurs primitives telles quelles", () => {
    expect(deepCopy(null)).toBeNull()
    expect(deepCopy(undefined)).toBeUndefined()
    expect(deepCopy(42)).toBe(42)
    expect(deepCopy("hello")).toBe("hello")
    expect(deepCopy(true)).toBe(true)
  })

  it("clone un objet plat sans partager la référence", () => {
    const input = { a: 1, b: "two" }
    const output = deepCopy(input)
    expect(output).toEqual(input)
    expect(output).not.toBe(input)
  })

  it("clone récursivement les objets imbriqués", () => {
    const input = { a: { b: { c: 1 } } }
    const output = deepCopy(input)
    expect(output).toEqual(input)
    expect(output.a).not.toBe(input.a)
    expect(output.a.b).not.toBe(input.a.b)
  })

  it("clone les tableaux et leurs éléments", () => {
    const input = [{ a: 1 }, { a: 2 }]
    const output = deepCopy(input)
    expect(output).toEqual(input)
    expect(output).not.toBe(input)
    expect(output[0]).not.toBe(input[0])
  })

  it("ne boucle pas à l'infini sur les références circulaires", () => {
    const input: { name: string; self?: unknown } = { name: "root" }
    input.self = input
    const output = deepCopy(input) as { name: string; self: unknown }
    expect(output.name).toBe("root")
    expect(output.self).toBe(output)
    expect(output).not.toBe(input)
  })

  it("retourne un ReactElement par référence (sans le cloner) pour éviter une boucle infinie", () => {
    const reactElement = {
      $$typeof: Symbol.for("react.element"),
      type: "div",
      props: { children: "hello" },
      key: null,
      ref: null,
    }
    const input = { description: reactElement }
    const output = deepCopy(input)
    expect(output).not.toBe(input)
    expect(output.description).toBe(reactElement)
  })

  it("clone un objet contenant un ReactElement sans erreur", () => {
    const reactElement = {
      $$typeof: Symbol.for("react.element"),
      type: "a",
      props: {
        href: "https://example.com",
        children: "lien",
      },
      key: null,
      ref: null,
    }
    // Simule la référence circulaire interne d'un ReactElement (owner ↔ element)
    ;(reactElement as unknown as { _owner: unknown })._owner = reactElement

    const input = {
      googleBusinessUrl: {
        description: reactElement,
        placeholder: "https://...",
      },
    }
    expect(() => deepCopy(input)).not.toThrow()
    const output = deepCopy(input)
    expect(output.googleBusinessUrl.placeholder).toBe("https://...")
    expect(output.googleBusinessUrl.description).toBe(reactElement)
  })
})
