import { describe, expect, it } from "vitest"
import { createForm } from "@/form/utils/createForm"
import { formHasError } from "@/form/utils/formHasError"

describe("formHasError", () => {
  it("retourne false si aucun input n'a de violations", () => {
    const form = createForm({
      inputs: {
        name: { value: "Alice", violations: [] },
        email: { value: "alice@test.fr" },
      },
    })

    expect(formHasError(form)).toBe(false)
  })

  it("retourne true si un input a au moins une violation", () => {
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

  it("retourne false si le formulaire n'a pas d'inputs", () => {
    const form = createForm({ inputs: {} })

    expect(formHasError(form)).toBe(false)
  })

  it("retourne false si form.inputs est undefined", () => {
    const form = { inputs: undefined } as any

    expect(formHasError(form)).toBe(false)
  })

  it("retourne false si toutes les violations sont des tableaux vides", () => {
    const form = createForm({
      inputs: {
        a: { violations: [] },
        b: { violations: [] },
      },
    })

    expect(formHasError(form)).toBe(false)
  })

  it("retourne true dès qu'un seul input a une violation", () => {
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
