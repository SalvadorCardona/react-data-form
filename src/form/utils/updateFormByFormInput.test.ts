import { describe, expect, it } from "vitest"
import { createForm } from "@/form/utils/createForm"
import { updateFormByFormInput } from "@/form/utils/updateFormByFormInput"

describe("updateFormByFormInput", () => {
  it("met à jour la valeur d'un input existant", () => {
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

  it("synchronise form.data après la mise à jour d'un input", () => {
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

  it("lève une erreur si l'input n'a pas de name", () => {
    const form = createForm({ inputs: { name: {} } })
    const inputWithoutName = { ...form.inputs.name, name: undefined as any }

    expect(() => updateFormByFormInput(form, inputWithoutName)).toThrow(
      "FormInput hasn't name"
    )
  })

  it("retourne le formulaire inchangé si l'input n'existe pas dans le formulaire", () => {
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

  it("fusionne les propriétés de l'input (ne perd pas les métadonnées)", () => {
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

  it("ne modifie pas le formulaire original (immutabilité)", () => {
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

    // Le form.inputs.name.value original ne change pas (seul form.data change via référence)
    expect(originalName).toBe("Alice")
  })
})
