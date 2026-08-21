import {
  BaseJsonLdItemInterface,
  getLdType,
  isJsonLdItem,
} from "@/registry/jsonLd/jsonLDItem"
import { describe, expect, it } from "vitest"

const mockJsonLdItem: BaseJsonLdItemInterface = {
  "@id": "/type/mock/123",
  "@type": "/type/mock",
}

const mockNotjsonLdItem = {
  id: "/type/mock/123",
  type: "/type/mock",
}

describe("Test isJsonLdItem", () => {
  it("Is isJsonLdItem", () => {
    expect(isJsonLdItem(mockJsonLdItem)).toBeTruthy()
  })

  it("Is isJsonLdItem", () => {
    expect(isJsonLdItem(mockNotjsonLdItem)).toBeFalsy()
  })
})

describe("Test getLdType", () => {
  it("Is getLdType", () => {
    expect(getLdType(mockJsonLdItem)).toBe("/type/mock")
    expect("/type/mock").toBe("/type/mock")
  })

  it("Is isJsonLdItem", () => {
    expect(getLdType(mockNotjsonLdItem)).toBeUndefined()
  })
})
