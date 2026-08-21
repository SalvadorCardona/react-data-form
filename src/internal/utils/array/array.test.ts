import { describe, expect, it } from "vitest"
import {
  addValue,
  getIndexByColumn,
  removeByColumn,
  removeByIndex,
  removeValue,
  toggleValue,
  updateByIndex,
} from "./array"

const users = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
  { id: 3, name: "Charlie" },
]

describe("getIndexByColumn", () => {
  it("returns the correct index when found", () => {
    expect(getIndexByColumn(users, "id", 2)).toBe(1)
  })

  it("returns -1 when not found", () => {
    expect(getIndexByColumn(users, "id", 99)).toBe(-1)
  })
})

describe("updateByIndex", () => {
  it("returns a new array with the element replaced", () => {
    const result = updateByIndex(users, 1, { id: 2, name: "Bobby" })
    expect(result[1]).toEqual({ id: 2, name: "Bobby" })
    expect(result).toHaveLength(3)
  })

  it("does not mutate the original array", () => {
    const original = [...users]
    updateByIndex(users, 0, { id: 1, name: "Alicia" })
    expect(users[0]).toEqual(original[0])
  })
})

describe("removeByIndex", () => {
  it("removes the element at the given index", () => {
    const result = removeByIndex(users, 1)
    expect(result).toHaveLength(2)
    expect(result).not.toContainEqual({ id: 2, name: "Bob" })
  })
})

describe("removeByColumn", () => {
  it("removes the element matching the key/value", () => {
    const result = removeByColumn(users, "id", 2)
    expect(result).toHaveLength(2)
    expect(result).not.toContainEqual({ id: 2, name: "Bob" })
  })
})

describe("removeValue", () => {
  it("removes all occurrences of the value", () => {
    const arr = [1, 2, 3, 2, 4]
    expect(removeValue(arr, 2)).toEqual([1, 3, 4])
  })

  it("returns the same array if value not present", () => {
    expect(removeValue([1, 2, 3], 9)).toEqual([1, 2, 3])
  })
})

describe("addValue", () => {
  it("appends the value to the array", () => {
    expect(addValue([1, 2], 3)).toEqual([1, 2, 3])
  })

  it("does not mutate the original array", () => {
    const arr = [1, 2]
    addValue(arr, 3)
    expect(arr).toEqual([1, 2])
  })
})

describe("toggleValue", () => {
  it("adds a value that is not present", () => {
    expect(toggleValue([1, 2], 3)).toEqual([1, 2, 3])
  })

  it("removes a value that is already present", () => {
    expect(toggleValue([1, 2, 3], 2)).toEqual([1, 3])
  })
})
