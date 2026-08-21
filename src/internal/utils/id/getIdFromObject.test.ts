import { describe, expect, it } from "vitest"
import getIdFromObject from "@/internal/utils/id/getIdFromObject"

describe("Test Create Id", () => {
  it("Main ", () => {
    const sujet = getIdFromObject({ id: "a" })
    expect(sujet).toBe("a")

    const sujet2 = getIdFromObject({ "@id": "b" })
    expect(sujet2).toBe("b")

    const sujet3 = getIdFromObject({ "@id": "b", id: "a" })
    expect(sujet3).toBe("b")

    const sujet4 = getIdFromObject({ "@id": "b/c", id: "a" }, true)
    expect(sujet4).toBe("c")

    const sujet5 = getIdFromObject({ test: "5" }, true)
    expect(sujet5).toBe(undefined)
  })
})
