import { describe, expect, it } from "vitest"
import { createJsonLd } from "@/registry/jsonLd/createJsonLd"
import { getIdFromIri } from "@/registry/jsonLd/getIdFromIri"

describe("createJsonLd (sans mocks)", () => {
  it("ajoute @id, @type et @context à partir du type fourni", () => {
    const type = "/api/animals"
    const item = createJsonLd({ type, object: { name: "Rex" } })

    expect(item["@type"]).toBe(type)
    expect(item["@context"]).toBe(type)
    expect(item["@id"]).toMatch(new RegExp(`^${type}/`))
  })

  it("conserve les propriétés de l'objet source", () => {
    const item = createJsonLd({
      type: "/api/animals",
      object: { name: "Rex", age: 3 },
    })

    expect(item.name).toBe("Rex")
    expect(item.age).toBe(3)
  })

  it("génère un @id avec un identifiant aléatoire quand l'objet n'a pas d'id", () => {
    const type = "/api/animals"
    const item = createJsonLd({ type, object: { name: "Rex" } })

    // type + "/" + identifiant non vide
    const segment = item["@id"].slice(`${type}/`.length)
    expect(segment.length).toBeGreaterThan(0)
  })

  it("définit la propriété id à partir du @id quand l'objet source n'en a pas", () => {
    const item = createJsonLd({
      type: "/api/animals",
      object: { name: "Rex" },
    })

    const uri = item["@id"]
    expect(Object.hasOwn(item, "id")).toBe(true)
    expect(getIdFromIri(uri)).toBe(item.id)
  })

  it("utilise l'id de l'objet pour construire le @id", () => {
    const type = "/api/animals"
    const item = createJsonLd({
      type,
      object: { id: "abc-123", name: "Rex" },
    })

    expect(item["@id"]).toBe(`${type}/abc-123`)
  })

  it("dérive la propriété id du @id, cohérente avec l'id de l'objet", () => {
    const type = "/api/animals"
    const item = createJsonLd({
      type,
      object: { id: "abc-123", name: "Rex" },
    })

    expect(Object.hasOwn(item, "id")).toBe(true)
    expect(item.id).toBe("abc-123")
    expect(item.id).toBe(getIdFromIri(item["@id"]))
  })

  it("traite un id vide comme absent pour le calcul du @id", () => {
    const type = "/api/animals"
    const item = createJsonLd({
      type,
      object: { id: "", name: "Rex" },
    })

    // id falsy → @id construit avec un identifiant aléatoire, pas avec ""
    expect(item["@id"]).not.toBe(`${type}/`)
    expect(item["@id"].slice(`${type}/`.length).length).toBeGreaterThan(0)
  })

  it("préfixe le @id par / quand le type ne commence pas par un slash", () => {
    const item = createJsonLd({ type: "animals", object: { name: "Rex" } })

    expect(item["@id"]).toMatch(/^\/animals\//)
  })

  it("ne double pas le slash quand le type commence déjà par /", () => {
    const item = createJsonLd({
      type: "/api/addresses",
      object: { id: "abc-123" },
    })

    expect(item["@id"]).toBe("/api/addresses/abc-123")
  })

  it("génère des @id différents pour deux appels sans id", () => {
    const type = "/api/animals"
    const a = createJsonLd({ type, object: { name: "Rex" } })
    const b = createJsonLd({ type, object: { name: "Rex" } })

    expect(a["@id"]).not.toBe(b["@id"])
  })
})
