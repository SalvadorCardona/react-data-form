import { describe, expect, it } from "vitest"
import { getFormConfig, setFormConfig } from "@/form/FormConfig"
import { createForm } from "@/form/utils/createForm"

describe("FormConfig", () => {
  it("gives every form its own errors array", () => {
    const first = createForm({ inputs: { a: {} } })
    first.errors.push("leaked")

    const second = createForm({ inputs: { b: {} } })

    expect(second.errors).toEqual([])
    expect(getFormConfig().defaultForm.errors).toEqual([])
  })

  it("shares no array or object with the default form", () => {
    const { defaultForm } = getFormConfig()
    const form = createForm({})

    expect(form.errors).not.toBe(defaultForm.errors)
    expect(form.label).not.toBe(defaultForm.label)
    expect(form.inputs).not.toBe(defaultForm.inputs)
    expect(form.components).not.toBe(defaultForm.components)
    expect(form.components.formErrors).toBe(defaultForm.components?.formErrors)
  })

  it("replaces arrays instead of concatenating them when set twice", () => {
    const defaultForm = getFormConfig().defaultForm

    setFormConfig({ defaultForm: { ...defaultForm, groups: ["main"] } })
    setFormConfig({
      defaultForm: { ...getFormConfig().defaultForm, groups: ["main"] },
    })

    expect(getFormConfig().defaultForm.groups).toEqual(["main"])
    expect(createForm({}).groups).toEqual(["main"])
    expect(createForm({}).groups).not.toBe(getFormConfig().defaultForm.groups)
  })
})
