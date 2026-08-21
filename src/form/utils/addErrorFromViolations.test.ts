import { describe, expect, it } from "vitest"
import { createForm } from "@/form/utils/createForm"
import { addErrorFromViolations } from "@/form/utils/addErrorFromViolations"

describe("addErrorFromViolations", () => {
  it("clears every existing violation before applying the new ones", () => {
    const form = createForm({
      inputs: {
        name: { value: "Alice", violations: [{ message: "ancienne erreur" }] },
      },
    })

    const result = addErrorFromViolations(form, { violations: [] } as any)

    expect(result.inputs.name.violations).toEqual([])
  })

  it("maps the API violations onto the matching inputs", () => {
    const form = createForm({
      inputs: {
        email: { value: "" },
        name: { value: "" },
      },
    })

    const apiError = {
      violations: [
        { propertyPath: "email", message: "Email invalide", code: "invalid_email" },
        { propertyPath: "name", message: "Nom requis", code: "required" },
      ],
    } as any

    const result = addErrorFromViolations(form, apiError)

    expect(result.inputs.email.violations).toHaveLength(1)
    expect(result.inputs.email.violations![0].message).toBe("Email invalide")
    expect(result.inputs.name.violations).toHaveLength(1)
    expect(result.inputs.name.violations![0].message).toBe("Nom requis")
  })

  it("ignores violations on unknown property paths", () => {
    const form = createForm({
      inputs: {
        name: { value: "Alice" },
      },
    })

    const apiError = {
      violations: [{ propertyPath: "unknown_field", message: "Champ inconnu" }],
    } as any

    const result = addErrorFromViolations(form, apiError)

    expect(result.inputs.name.violations).toEqual([])
  })

  it("adds no global error when propertyPath is empty", () => {
    // With the current implementation, `if (!propertyPath) return` prevents
    // d'atteindre la branche `propertyPath === ""`. Ce test documente ce comportement.
    const form = createForm(
      {
        inputs: {
          name: {},
        },
      },
      { name: "Bob" }
    )

    const apiError = {
      violations: [{ propertyPath: "", message: "General error" }],
    } as any

    const result = addErrorFromViolations(form, apiError)

    // The violation is silently dropped — no error is added
    expect(result.errors ?? []).toHaveLength(0)
  })

  it("returns the form unchanged when apiError carries no violations", () => {
    const form = createForm({
      inputs: {
        email: { value: "test@test.fr" },
      },
    })

    const result = addErrorFromViolations(form, {} as any)

    expect(result.inputs.email.violations).toEqual([])
  })

  it("accumulates several violations on the same field", () => {
    const form = createForm({
      inputs: {
        password: { value: "123" },
      },
    })

    const apiError = {
      violations: [
        { propertyPath: "password", message: "Trop court" },
        { propertyPath: "password", message: "Doit contenir un chiffre" },
      ],
    } as any

    const result = addErrorFromViolations(form, apiError)

    expect(result.inputs.password.violations).toHaveLength(2)
    expect(result.inputs.password.violations![0].message).toBe("Trop court")
    expect(result.inputs.password.violations![1].message).toBe(
      "Doit contenir un chiffre"
    )
  })
})
