import { getLdTypeFromUri } from "@/registry/jsonLd/getLdTypeFromUri"
import { expect, test } from "vitest"

const good = [
  "/api/a/1ef70d90-7bab-6976-928f-e1fa89cd64d9",
  "/api/b/1eefe610-2800-6852-884e-032dd891dde6",
  "/front/c/a/1eefe610-2800-6852-884e-032dd891dde6",
]

// Test cases for `extractJsonLdType`
test("Extract JsonLdType", () => {
  expect(getLdTypeFromUri(good[0])).toBe("/api/a")
  expect(getLdTypeFromUri(good[1])).toBe("/api/b")
  expect(getLdTypeFromUri(good[2])).toBe("/front/c/a")
})
