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

  it("sends violations on unknown property paths to form.errors", () => {
    const form = createForm({
      inputs: {
        name: { value: "Alice" },
      },
    })

    const apiError = {
      violations: [{ propertyPath: "unknown_field", message: "Unknown field" }],
    } as any

    const result = addErrorFromViolations(form, apiError)

    expect(result.inputs.name.violations).toEqual([])
    expect(result.errors).toEqual(["Unknown field"])
  })

  it("sends violations with an empty propertyPath to form.errors", () => {
    const form = createForm({ inputs: { a: {} } })

    const apiError = {
      violations: [{ propertyPath: "", message: "Global" }, { message: "No path" }],
    } as any

    const result = addErrorFromViolations(form, apiError)

    expect(result.errors).toEqual(["Global", "No path"])
    expect(result.inputs.a.violations).toEqual([])
  })

  it("falls back to an English message when a violation has none", () => {
    const form = createForm({ inputs: { a: {} } })

    const result = addErrorFromViolations(form, {
      violations: [{ propertyPath: "" }],
    } as any)

    expect(result.errors).toEqual(["Invalid value"])
  })

  it.each(["address.street", "address[0].street", "address.0.street"])(
    "puts the nested violation %s on the parent field",
    (propertyPath) => {
      const form = createForm({ inputs: { address: {}, name: {} } })

      const result = addErrorFromViolations(form, {
        violations: [{ propertyPath, message: "nested" }],
      } as any)

      expect(result.inputs.address.violations).toEqual([
        { propertyPath, message: "nested" },
      ])
      expect(result.inputs.name.violations).toEqual([])
      expect(result.errors).toEqual([])
    }
  )

  it("prefers the input whose key matches the longest part of the path", () => {
    const form = createForm({
      inputs: { address: {}, "address.street": {} },
    })

    const result = addErrorFromViolations(form, {
      violations: [{ propertyPath: "address.street.number", message: "nested" }],
    } as any)

    expect(result.inputs["address.street"].violations).toHaveLength(1)
    expect(result.inputs.address.violations).toEqual([])
  })

  it("resets form.errors on each call instead of accumulating", () => {
    const form = createForm({ inputs: { a: {} } })
    const apiError = { violations: [{ propertyPath: "", message: "Global" }] } as any

    const first = addErrorFromViolations(form, apiError)
    const second = addErrorFromViolations(first, apiError)

    expect(second.errors).toEqual(["Global"])
    expect(addErrorFromViolations(second, { violations: [] } as any).errors).toEqual(
      []
    )
  })

  it("does not leak form errors to another form", () => {
    const form = createForm({ inputs: { a: {} } })
    const other = createForm({ inputs: { b: {} } })

    addErrorFromViolations(form, {
      violations: [{ propertyPath: "", message: "Global" }],
    } as any)

    expect(other.errors).toEqual([])
    expect(createForm({ inputs: { c: {} } }).errors).toEqual([])
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
