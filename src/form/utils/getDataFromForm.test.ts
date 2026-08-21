import { describe, expect, it } from "vitest"
import { createForm } from "@/form/utils/createForm"
import { getDataFromForm } from "@/form/utils/getDataFromForm"

describe("getDataFromForm", () => {
  it("extracts the value of every input into a data object", () => {
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

  it("returns undefined for inputs without a value", () => {
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

  it("returns an empty object when the form has no inputs", () => {
    const form = createForm({ inputs: {} })

    const data = getDataFromForm(form)

    expect(data).toEqual({})
  })

  it("syncs with the current input values", () => {
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

  it("returns values of mixed types (string, number, boolean, null)", () => {
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
