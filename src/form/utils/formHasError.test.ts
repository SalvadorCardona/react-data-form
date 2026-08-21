import { describe, expect, it } from "vitest"
import { createForm } from "@/form/utils/createForm"
import { formHasError } from "@/form/utils/formHasError"

describe("formHasError", () => {
  it("returns false when no input has violations", () => {
    const form = createForm({
      inputs: {
        name: { value: "Alice", violations: [] },
        email: { value: "alice@test.fr" },
      },
    })

    expect(formHasError(form)).toBe(false)
  })

  it("returns true when an input has at least one violation", () => {
    const form = createForm({
      inputs: {
        name: { value: "Alice" },
        email: {
          value: "",
          violations: [{ message: "Email requis" }],
        },
      },
    })

    expect(formHasError(form)).toBe(true)
  })

  it("returns false when the form has no inputs", () => {
    const form = createForm({ inputs: {} })

    expect(formHasError(form)).toBe(false)
  })

  it("returns false when form.inputs is undefined", () => {
    const form = { inputs: undefined } as any

    expect(formHasError(form)).toBe(false)
  })

  it("returns false when every violation list is empty", () => {
    const form = createForm({
      inputs: {
        a: { violations: [] },
        b: { violations: [] },
      },
    })

    expect(formHasError(form)).toBe(false)
  })

  it("returns true as soon as a single input has a violation", () => {
    const form = createForm({
      inputs: {
        a: { violations: [] },
        b: { violations: [{ message: "Erreur" }] },
        c: { violations: [] },
      },
    })

    expect(formHasError(form)).toBe(true)
  })
})
