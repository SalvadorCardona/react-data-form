import { describe, expect, it, vi } from "vitest"
import { createForm } from "@/form/utils/createForm"
import getFormInputsFromForm from "@/form/utils/getFormInputsFromForm"

describe("createForm", () => {
  it("crée un form avec un id par défaut si manquant", () => {
    const form = createForm({ inputs: {} })
    expect(form.id).toBeDefined()
  })

  it("définit action=update si data a un id ; sinon create", () => {
    const form = createForm({ inputs: {} }, { id: 123 })
    expect(form.action).toBe("update")

    const form2 = createForm({ inputs: {} }, {})
    expect(form2.action).toBe("create")
  })

  it("génère des inputs pour chaque clé de data si allowGeneratedValue vaut true", () => {
    const form = createForm(
      {
        allowGeneratedValue: true,
        inputs: {},
      },
      { name: "alice", age: 30 }
    )
    expect(form.inputs.name).toBeDefined()
    expect(form.inputs.age).toBeDefined()
    expect(form.inputs.name.generatedValue).toBeTruthy()
    expect(form.inputs.name.value).toBe("alice")
    expect(form.inputs.name.id).toBeDefined()
  })

  it("utilise defaultValue si la valeur n’est pas présente et version=1", () => {
    const form = createForm(
      {
        inputs: {
          foo: { defaultValue: "bar" },
        },
        version: 1,
      },
      {}
    )
    expect(form.inputs.foo.value).toBe("bar")
  })

  it("appelle defaultValue si c’est une fonction", () => {
    const defaultFn = vi.fn(() => "fromFn")
    const form = createForm(
      {
        inputs: {
          hello: { defaultValue: defaultFn },
        },
        version: 1,
      },
      {}
    )
    expect(defaultFn).toHaveBeenCalled()
    expect(form.inputs.hello.value).toBe("fromFn")
  })

  it("retourne une instance conforme à FormBuiltInterface", () => {
    const form = createForm({ inputs: {} })
    expect(form).toHaveProperty("inputs")
    expect(form).toHaveProperty("id")
    expect(form).toHaveProperty("version")
    expect(form).toHaveProperty("data")
  })

  it("test form input order ", () => {
    const form = createForm({
      inputs: {
        w: { name: "w", order: 1 },
        x: { name: "x", order: 2 },
        y: { name: "y", order: null as unknown as number },
        z: { name: "z" },
      } as any,
    })

    const result = getFormInputsFromForm(form)
    expect(result.map((r) => r.name)).toEqual(["w", "x", "y", "z"])
    expect(result[0].order).toBe(1)
    expect(result[1].order).toBe(2)
    expect(result[2].order).toBeNull()
    expect(result[3].order).toBeUndefined()
  })

  it("filtre les inputs selon form.groups si présent", () => {
    const form = createForm({
      inputs: {
        a: { name: "a", order: 1, groups: ["g1"] },
        b: { name: "b", order: 2, groups: ["g2"] },
        c: { name: "c", order: 3, groups: ["g1", "g3"] },
      },
      groups: ["g1"],
    })

    const result = getFormInputsFromForm(form)
    const names = result.map((r) => r.name).sort()
    expect(names).toEqual(["a", "c"].sort())
    expect(
      result.every((r) => r.groups && r.groups.some((g) => form.groups!.includes(g)))
    ).toBe(true)
  })
})
