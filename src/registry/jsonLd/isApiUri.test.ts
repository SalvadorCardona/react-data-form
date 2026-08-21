import createUniqId from "@/internal/utils/id/createUniqId"
import isApiIri from "./isApiIri"
import { describe, expect, it, test } from "vitest"

const good = [
  "/api/name/1ef70d90-7bab-6976-928f-e1fa89cd64d9",
  "/api/name/1eefe610-2800-6852-884e-032dd891dde6",
]

const bad = ["a/b/C", "api/name/test"]

test("Test Create Id", () => {
  const id = createUniqId()
  expect(typeof id).toBe("string")
  expect(id).toBeTruthy()
})

describe("Test if is API URI", () => {
  it("Is Api URI", () => {
    good.forEach((e) => {
      expect(isApiIri(e)).toBeTruthy()
    })
  })

  it("Is not api Uri", () => {
    bad.forEach((e) => {
      expect(isApiIri(e)).toBeFalsy()
    })
  })
})
