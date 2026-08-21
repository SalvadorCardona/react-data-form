import { describe, expect, it } from "vitest"
import { getIdFromIri } from "@/registry/jsonLd/getIdFromIri"

describe("getIdFromIri (sans mocks)", () => {
  it("retourne la même chaîne si ce n'est pas une IRI API", () => {
    const input = "not-an-api-iri"
    const result = getIdFromIri(input)
    expect(result).toBe(input)
  })

  it("retourne le dernier segment après le slash pour une IRI API classique", () => {
    const input = "https://api.example.com/resource/12345"
    const result = getIdFromIri(input)
    expect(result).toBe("12345")
  })

  it("gère une IRI API avec slash final", () => {
    const input = "https://api.example.com/resource/12345/"
    const result = getIdFromIri(input)
    // selon le comportement actuel de la fonction, le dernier segment sera "" si la chaîne se termine par '/'
    // Si vous souhaitez un autre comportement (p.ex. ignorer les segments vides) ajustez la fonction et les attentes.
    expect(result).toBe("")
  })

  it("retourne le segment final incluant la query si présente", () => {
    const input = "https://api.example.com/resource/12345?foo=bar"
    const result = getIdFromIri(input)
    expect(result).toBe("12345?foo=bar")
  })

  it("fonctionne avec des IRIs relatives courantes (ex: /api/..)", () => {
    const input = "/api/workspaces/abcd-ef12-3456"
    const result = getIdFromIri(input)
    expect(result).toBe("abcd-ef12-3456")
  })
})
