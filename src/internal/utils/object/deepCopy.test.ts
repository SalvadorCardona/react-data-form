import { describe, expect, it } from "vitest"
import { deepCopy } from "@/internal/utils/object/deepCopy"

describe("deepCopy", () => {
  it("returns primitive values as-is", () => {
    expect(deepCopy(null)).toBeNull()
    expect(deepCopy(undefined)).toBeUndefined()
    expect(deepCopy(42)).toBe(42)
    expect(deepCopy("hello")).toBe("hello")
    expect(deepCopy(true)).toBe(true)
  })

  it("clones a flat object without sharing the reference", () => {
    const input = { a: 1, b: "two" }
    const output = deepCopy(input)
    expect(output).toEqual(input)
    expect(output).not.toBe(input)
  })

  it("clones nested objects recursively", () => {
    const input = { a: { b: { c: 1 } } }
    const output = deepCopy(input)
    expect(output).toEqual(input)
    expect(output.a).not.toBe(input.a)
    expect(output.a.b).not.toBe(input.a.b)
  })

  it("clones arrays and their elements", () => {
    const input = [{ a: 1 }, { a: 2 }]
    const output = deepCopy(input)
    expect(output).toEqual(input)
    expect(output).not.toBe(input)
    expect(output[0]).not.toBe(input[0])
  })

  it("does not loop forever on circular references", () => {
    const input: { name: string; self?: unknown } = { name: "root" }
    input.self = input
    const output = deepCopy(input) as { name: string; self: unknown }
    expect(output.name).toBe("root")
    expect(output.self).toBe(output)
    expect(output).not.toBe(input)
  })

  it("returns a ReactElement by reference, without cloning, to avoid an infinite loop", () => {
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

  it("clones an object holding a ReactElement without throwing", () => {
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
    // Mimics the internal circular reference of a ReactElement (owner ↔ element)
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
