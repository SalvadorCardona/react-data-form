import { describe, expect, it } from "vitest"
import { isDeepEqual } from "@/internal/utils/object/isDeepEqual"

describe("isDeepEqual", () => {
  it("compares primitives", () => {
    expect(isDeepEqual(1, 1)).toBe(true)
    expect(isDeepEqual("a", "b")).toBe(false)
    expect(isDeepEqual(NaN, NaN)).toBe(true)
    expect(isDeepEqual(null, undefined)).toBe(false)
  })

  it("compares nested objects and arrays", () => {
    expect(isDeepEqual({ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] })).toBe(true)
    expect(isDeepEqual({ a: [1, { b: 2 }] }, { a: [1, { b: 3 }] })).toBe(false)
    expect(isDeepEqual([1, 2], [1, 2, 3])).toBe(false)
  })

  it("treats a missing key as undefined", () => {
    expect(isDeepEqual({ a: 1, b: undefined }, { a: 1 })).toBe(true)
  })

  it("compares dates by their time", () => {
    expect(isDeepEqual(new Date(0), new Date(0))).toBe(true)
    expect(isDeepEqual(new Date(0), new Date(1))).toBe(false)
  })

  it("compares other objects by reference", () => {
    const file = new File(["a"], "a.txt")
    expect(isDeepEqual(file, file)).toBe(true)
    expect(isDeepEqual(file, new File(["a"], "a.txt"))).toBe(false)
  })
})
