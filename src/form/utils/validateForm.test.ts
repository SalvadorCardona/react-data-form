import { describe, expect, it, vi } from "vitest"
import { createForm } from "@/form/utils/createForm"
import { validateForm } from "@/form/utils/validateForm"
import { formHasError } from "@/form/utils/formHasError"

describe("validateForm", () => {
  it("returns the form unchanged when no validator is defined", () => {
    const form = createForm({
      inputs: {
        name: { value: "Alice" },
      },
    })

    const result = validateForm(form)

    expect(result.inputs.name.violations).toEqual([])
    expect(formHasError(result)).toBe(false)
  })

  it("clears existing violations before validating again", () => {
    const form = createForm({
      inputs: {
        name: {
          value: "ok",
          violations: [{ message: "ancienne erreur" }],
        },
      },
    })

    const result = validateForm(form)

    expect(result.inputs.name.violations).toEqual([])
  })

  it("creates a violation when the validator throws a plain Error", () => {
    const form = createForm(
      {
        inputs: {
          age: {
            validator: (value) => {
              if ((value as number) < 0) throw new Error("Age must be positive")
            },
          },
        },
      },
      { age: -1 }
    )

    const result = validateForm(form)

    expect(result.inputs.age.violations).toHaveLength(1)
    expect(result.inputs.age.violations![0].message).toBe("Age must be positive")
    expect(formHasError(result)).toBe(true)
  })

  it("creates an 'Unknown Error' violation when the validator throws a non-Error value", () => {
    const form = createForm({
      inputs: {
        field: {
          value: null,
          validator: () => {
            throw "string error"
          },
        },
      },
    })

    const result = validateForm(form)

    expect(result.inputs.field.violations).toHaveLength(1)
    expect(result.inputs.field.violations![0].message).toBe("Unknown error")
  })

  it("creates several violations for a Zod error with multiple issues", () => {
    const zodLikeError = new Error("Zod error") as any
    zodLikeError.issues = [
      { code: "too_small", path: [], message: "Valeur trop petite" },
      { code: "invalid_type", path: [], message: "Type invalide" },
    ]

    const form = createForm({
      inputs: {
        amount: {
          value: 0,
          validator: () => {
            throw zodLikeError
          },
        },
      },
    })

    const result = validateForm(form)

    expect(result.inputs.amount.violations).toHaveLength(2)
    expect(result.inputs.amount.violations![0].message).toBe("Valeur trop petite")
    expect(result.inputs.amount.violations![0].code).toBe("too_small")
    expect(result.inputs.amount.violations![1].message).toBe("Type invalide")
  })

  it("does not validate generated inputs", () => {
    const validator = vi.fn(() => {
      throw new Error("should not be called")
    })

    const form = createForm({
      inputs: {
        hidden: {
          value: "x",
          generatedValue: true,
          validator,
        },
      },
    })

    validateForm(form)

    expect(validator).not.toHaveBeenCalled()
  })

  it("validates several inputs and accumulates the errors", () => {
    const form = createForm({
      inputs: {
        email: {
          value: "invalid",
          validator: (v) => {
            if (!(v as string).includes("@")) throw new Error("Email invalide")
          },
        },
        password: {
          value: "123",
          validator: (v) => {
            if ((v as string).length < 8) throw new Error("Mot de passe trop court")
          },
        },
      },
    })

    const result = validateForm(form)

    expect(result.inputs.email.violations).toHaveLength(1)
    expect(result.inputs.password.violations).toHaveLength(1)
    expect(formHasError(result)).toBe(true)
  })

  it("flags no error when the validator passes", () => {
    const form = createForm(
      {
        inputs: {
          email: {
            validator: (v) => {
              if (!(v as string).includes("@")) throw new Error("Email invalide")
            },
          },
        },
      },
      { email: "test@test.fr" }
    )

    const result = validateForm(form)

    expect(result.inputs.email.violations).toHaveLength(0)
    expect(formHasError(result)).toBe(false)
  })
})
