import { describe, expect, it } from "vitest"
import { createForm } from "@/form/utils/createForm"
import { getDataFromForm } from "@/form/utils/getDataFromForm"

describe("getDataFromForm", () => {
  it("extrait les valeurs de chaque input dans un objet de données", () => {
    const form = createForm(
      {
        inputs: {
          name: {},
          email: {},
        },
      },
      { name: "Alice", email: "alice@test.fr" }
    )

    const data = getDataFromForm(form)

    expect(data).toMatchObject({ name: "Alice", email: "alice@test.fr" })
  })

  it("retourne undefined pour les inputs sans valeur définie", () => {
    const form = createForm(
      {
        inputs: {
          name: {},
          description: {},
        },
      },
      { name: "Bob" }
    )

    const data = getDataFromForm(form) as { name?: string; description?: string }

    expect(data.name).toBe("Bob")
    expect(data.description).toBeUndefined()
  })

  it("retourne un objet vide si le formulaire n'a pas d'inputs", () => {
    const form = createForm({ inputs: {} })

    const data = getDataFromForm(form)

    expect(data).toEqual({})
  })

  it("synchronise avec les valeurs courantes des inputs", () => {
    const form = createForm(
      {
        inputs: {
          count: {},
        },
      },
      { count: 42 }
    )

    const data = getDataFromForm(form)

    expect(data.count).toBe(42)
  })

  it("retourne des valeurs de types variés (string, number, boolean, null)", () => {
    const form = createForm(
      {
        inputs: {
          text: {},
          count: {},
          active: {},
          nullable: {},
        },
      },
      { text: "hello", count: 10, active: true, nullable: null }
    )

    const data = getDataFromForm(form)

    expect(data).toMatchObject({
      text: "hello",
      count: 10,
      active: true,
      nullable: null,
    })
  })
})
