import { describe, expect, it } from "vitest"
import { createForm } from "@/form/utils/createForm"
import { updateFormByFormInput } from "@/form/utils/updateFormByFormInput"

describe("updateFormByFormInput", () => {
  it("updates the value of an existing input", () => {
    const form = createForm(
      {
        inputs: {
          name: {},
        },
      },
      { name: "Alice" }
    )

    const updatedInput = { ...form.inputs.name, value: "Bob" }
    const result = updateFormByFormInput(form, updatedInput)

    expect(result.inputs.name.value).toBe("Bob")
  })

  it("syncs form.data after an input update", () => {
    const form = createForm(
      {
        inputs: {
          name: {},
          email: {},
        },
      },
      { name: "Alice", email: "alice@test.fr" }
    )

    const updatedInput = { ...form.inputs.email, value: "bob@test.fr" }
    const result = updateFormByFormInput(form, updatedInput)

    expect(result.data.email).toBe("bob@test.fr")
    expect(result.data.name).toBe("Alice")
  })

  it("throws when the input has no name", () => {
    const form = createForm({ inputs: { name: {} } })
    const inputWithoutName = { ...form.inputs.name, name: undefined as any }

    expect(() => updateFormByFormInput(form, inputWithoutName)).toThrow(
      "FormInput hasn't name"
    )
  })

  it("returns the form unchanged when the input is not part of it", () => {
    const form = createForm(
      {
        inputs: {
          name: {},
        },
      },
      { name: "Alice" }
    )

    const unknownInput = { name: "unknown_field", value: "xyz" }
    const result = updateFormByFormInput(form, unknownInput as any)

    expect(result).toBe(form)
  })

  it("merges the input properties without losing its metadata", () => {
    const form = createForm(
      {
        inputs: {
          email: {
            label: "Email",
            required: true,
          },
        },
      },
      { email: "old@test.fr" }
    )

    const updatedInput = { ...form.inputs.email, value: "new@test.fr" }
    const result = updateFormByFormInput(form, updatedInput)

    expect(result.inputs.email.label).toBe("Email")
    expect(result.inputs.email.required).toBe(true)
    expect(result.inputs.email.value).toBe("new@test.fr")
  })

  it("does not mutate the original form", () => {
    const form = createForm(
      {
        inputs: {
          name: {},
        },
      },
      { name: "Alice" }
    )

    const originalName = form.inputs.name.value
    const updatedInput = { ...form.inputs.name, value: "Charlie" }
    updateFormByFormInput(form, updatedInput)

    // The original form.inputs.name.value is untouched; only form.data changes
    expect(originalName).toBe("Alice")
  })
})
