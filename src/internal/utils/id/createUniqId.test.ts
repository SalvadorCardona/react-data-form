import createUniqId from "./createUniqId"
import { describe, expect, it } from "vitest"

describe("Test Create Id", () => {
  it("Main ", () => {
    const id = createUniqId()
    expect(typeof id).toBe("string")
    expect(id).toBeTruthy()
  })
})
