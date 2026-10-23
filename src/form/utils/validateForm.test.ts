import { describe, expect, it, vi } from "vitest"
import { createForm } from "@/form/utils/createForm"
import { validateForm } from "@/form/utils/validateForm"
import { formHasError } from "@/form/utils/formHasError"
import { SelectInputController } from "@/form/component/InputController/SelectInputController"

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

  describe("min and max", () => {
    it.each([
      ["below the minimum", 5, "This value should be greater than or equal to 10"],
      ["above the maximum", 25, "This value should be less than or equal to 20"],
    ])("adds a violation to a number %s", (_, value, message) => {
      const form = createForm({ inputs: { n: { min: 10, max: 20 } } }, { n: value })

      const result = validateForm(form)

      expect(result.inputs.n.violations).toHaveLength(1)
      expect(result.inputs.n.violations![0].message).toBe(message)
      expect(result.inputs.n.value).toBe(value)
    })

    it.each([
      ["within the bounds", 10],
      ["null", null],
      ["an array", ["x"]],
    ])("does not add a violation to a value %s", (_, value) => {
      const form = createForm({ inputs: { n: { min: 10, max: 20 } } }, { n: value })

      expect(formHasError(validateForm(form))).toBe(false)
    })
  })

  describe("required", () => {
    it.each([
      ["undefined", undefined],
      ["null", null],
      ["an empty string", ""],
      ["an empty array", []],
    ])("adds a violation when a required input is %s", (_, value) => {
      const form = createForm(
        { inputs: { name: { required: true } } },
        { name: value }
      )

      const result = validateForm(form)

      expect(result.inputs.name.violations).toHaveLength(1)
      expect(result.inputs.name.violations![0].message).toBe(
        "This field is required"
      )
      expect(formHasError(result)).toBe(true)
    })

    it("applies whatever the controller", () => {
      const form = createForm({
        inputs: {
          a: {
            required: true,
            controller: SelectInputController,
            valueOptions: [{ label: "x", value: "x" }],
          },
        },
      })

      expect(formHasError(validateForm(form))).toBe(true)
    })

    it.each([
      ["false", false],
      ["0", 0],
      ["a string", "x"],
      ["a non-empty array", ["x"]],
    ])("does not consider %s as empty", (_, value) => {
      const form = createForm(
        { inputs: { name: { required: true } } },
        { name: value }
      )

      expect(formHasError(validateForm(form))).toBe(false)
    })

    it("does not run the validator of an empty required input", () => {
      const validator = vi.fn()
      const form = createForm({
        inputs: { name: { required: true, validator } },
      })

      const result = validateForm(form)

      expect(validator).not.toHaveBeenCalled()
      expect(result.inputs.name.violations).toHaveLength(1)
    })

    it("still runs the validator of a filled required input", () => {
      const form = createForm(
        {
          inputs: {
            email: {
              required: true,
              validator: () => {
                throw new Error("Email invalide")
              },
            },
          },
        },
        { email: "invalid" }
      )

      const result = validateForm(form)

      expect(result.inputs.email.violations).toHaveLength(1)
      expect(result.inputs.email.violations![0].message).toBe("Email invalide")
    })

    it("skips hidden and generated inputs", () => {
      const form = createForm({
        inputs: {
          typeHidden: { required: true, type: "hidden" },
          hiddenByLogic: { required: true, hidden: () => true },
          generated: { required: true, generatedValue: true },
        },
      })

      expect(formHasError(validateForm(form))).toBe(false)
    })

    it("skips every rule of an input hidden by the data", () => {
      const validator = vi.fn(() => {
        throw new Error("should not be called")
      })
      const form = createForm(
        {
          inputs: {
            type: {},
            company: {
              required: true,
              min: 10,
              validator,
              hidden: (data: any) => data.type !== "pro",
            },
          },
        },
        { type: "private", company: 1 }
      )

      expect(formHasError(validateForm(form))).toBe(false)
      expect(validator).not.toHaveBeenCalled()
    })

    it("hands the data and the form to hidden()", () => {
      const hidden = vi.fn(() => false)
      const form = createForm({ inputs: { name: { hidden } } }, { name: "Ada" })

      validateForm(form)

      expect(hidden).toHaveBeenCalledWith(form.data, form)
    })

    it("checks an input whose hidden() returns false", () => {
      const form = createForm({
        inputs: { name: { required: true, hidden: () => false } },
      })

      expect(formHasError(validateForm(form))).toBe(true)
    })

    it("skips inputs outside the current group", () => {
      const form = createForm(
        {
          groups: ["contact"],
          inputs: {
            firstName: { required: true, groups: ["identity"] },
            email: { required: true, groups: ["contact"] },
          },
        },
        { email: "a@b.c" }
      )

      const result = validateForm(form)

      expect(result.inputs.firstName.violations ?? []).toHaveLength(0)
      expect(formHasError(result)).toBe(false)
    })
  })
})
