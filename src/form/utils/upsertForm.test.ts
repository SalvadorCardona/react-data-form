import { describe, expect, it } from "vitest"
import { upsertForm } from "@/form/utils/upsertForm"
import { ActionList } from "@/internal/action/ActionList"

describe("upsertForm", () => {
  it("generates a unique id when none is provided", () => {
    const result = upsertForm({ inputs: {} })

    expect(result.id).toBeDefined()
    expect(typeof result.id).toBe("string")
  })

  it("keeps the provided id", () => {
    const result = upsertForm({ id: "my-form", inputs: {} })

    expect(result.id).toBe("my-form")
  })

  it("sets action=create when the data has no id", () => {
    const result = upsertForm({ inputs: {} }, { name: "Alice" } as any)

    expect(result.action).toBe(ActionList.create)
  })

  it("sets action=update when the data has an id", () => {
    const result = upsertForm({ inputs: {} }, { id: 42, name: "Alice" } as any)

    expect(result.action).toBe(ActionList.update)
  })

  it("keeps action=read when the form already sets it", () => {
    const result = upsertForm({ inputs: {}, action: ActionList.read }, {
      id: 42,
    } as any)

    expect(result.action).toBe(ActionList.read)
  })

  it("initialises the inputs from the data values", () => {
    const result = upsertForm(
      {
        inputs: {
          name: {},
          email: {},
        },
      },
      { name: "Alice", email: "alice@test.fr" } as any
    )

    expect(result.inputs.name.value).toBe("Alice")
    expect(result.inputs.email.value).toBe("alice@test.fr")
  })

  it("increments the version on every call", () => {
    const form = { inputs: {}, version: 1 }
    const result = upsertForm(form)

    expect(result.version).toBeGreaterThan(1)
  })

  it("computes form.data from the inputs", () => {
    const result = upsertForm({ inputs: { name: {}, age: {} } }, {
      name: "Bob",
      age: 30,
    } as any)

    expect(result.data).toMatchObject({ name: "Bob", age: 30 })
  })

  it("generates inputs for the data keys when allowGeneratedValue is true", () => {
    const result = upsertForm({ inputs: {}, allowGeneratedValue: true }, {
      firstName: "Charlie",
      score: 100,
    } as any)

    expect(result.inputs.firstName).toBeDefined()
    expect(result.inputs.score).toBeDefined()
    expect(result.inputs.firstName.generatedValue).toBe(true)
    expect(result.inputs.firstName.value).toBe("Charlie")
  })

  it("does not overwrite an existing input when allowGeneratedValue is true", () => {
    const result = upsertForm(
      {
        inputs: {
          name: { label: "Mon nom", required: true },
        },
        allowGeneratedValue: true,
      },
      { name: "David" } as any
    )

    expect(result.inputs.name.label).toBe("Mon nom")
    expect(result.inputs.name.required).toBe(true)
  })

  it("assigns an id to every input lacking one", () => {
    const result = upsertForm({
      inputs: {
        field1: {},
        field2: {},
      },
    })

    expect(result.inputs.field1.id).toBeDefined()
    expect(result.inputs.field2.id).toBeDefined()
  })

  it("uses the key as name when the input has none", () => {
    const result = upsertForm({
      inputs: {
        description: {},
      },
    })

    expect(result.inputs.description.name).toBe("description")
  })

  it("exposes originalData with the raw data passed in", () => {
    const data = { id: 5, name: "Eve" } as any
    const result = upsertForm({ inputs: {} }, data)

    expect(result.originalData).toBe(data)
  })

  it("does not mutate the inputs of the previous form outside isUpdate", () => {
    const original = upsertForm({ inputs: { vat: {} } }, { vat: 20 } as any)

    const updated = upsertForm(original, { vat: 0 } as any)

    expect(updated.inputs.vat.value).toBe(0)
    expect(updated.inputs.vat).not.toBe(original.inputs.vat)
    expect(original.inputs.vat.value).toBe(20)
  })

  it("in isUpdate mode, updates values without regenerating ids", () => {
    const original = upsertForm({ inputs: { name: {} } }, { name: "Alice" } as any)
    const originalId = original.inputs.name.id

    const updated = upsertForm(original, { name: "Bob" } as any, { isUpdate: true })

    expect(updated.inputs.name.value).toBe("Bob")
    expect(updated.inputs.name.id).toBe(originalId)
  })
})
