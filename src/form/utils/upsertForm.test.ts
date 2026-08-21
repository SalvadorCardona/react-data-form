import { describe, expect, it } from "vitest"
import { upsertForm } from "@/form/utils/upsertForm"
import { ActionList } from "@/internal/action/ActionList"

describe("upsertForm", () => {
  it("génère un id unique si aucun id n'est fourni", () => {
    const result = upsertForm({ inputs: {} })

    expect(result.id).toBeDefined()
    expect(typeof result.id).toBe("string")
  })

  it("conserve l'id fourni", () => {
    const result = upsertForm({ id: "my-form", inputs: {} })

    expect(result.id).toBe("my-form")
  })

  it("définit action=create si la data n'a pas d'id", () => {
    const result = upsertForm({ inputs: {} }, { name: "Alice" } as any)

    expect(result.action).toBe(ActionList.create)
  })

  it("définit action=update si la data a un id", () => {
    const result = upsertForm({ inputs: {} }, { id: 42, name: "Alice" } as any)

    expect(result.action).toBe(ActionList.update)
  })

  it("conserve action=read si défini dans le formulaire", () => {
    const result = upsertForm({ inputs: {}, action: ActionList.read }, {
      id: 42,
    } as any)

    expect(result.action).toBe(ActionList.read)
  })

  it("initialise les inputs avec les valeurs des data", () => {
    const result = upsertForm(
      {
        inputs: {
          name: {},
          email: {},
        },
      },
      { name: "Alice", email: "alice@test.fr" } as any
    )

    expect(result.inputs.name.value).toBe("Alice")
    expect(result.inputs.email.value).toBe("alice@test.fr")
  })

  it("incrémente la version à chaque appel", () => {
    const form = { inputs: {}, version: 1 }
    const result = upsertForm(form)

    expect(result.version).toBeGreaterThan(1)
  })

  it("calcule form.data depuis les inputs", () => {
    const result = upsertForm({ inputs: { name: {}, age: {} } }, {
      name: "Bob",
      age: 30,
    } as any)

    expect(result.data).toMatchObject({ name: "Bob", age: 30 })
  })

  it("génère les inputs pour les clés de data si allowGeneratedValue=true", () => {
    const result = upsertForm({ inputs: {}, allowGeneratedValue: true }, {
      firstName: "Charlie",
      score: 100,
    } as any)

    expect(result.inputs.firstName).toBeDefined()
    expect(result.inputs.score).toBeDefined()
    expect(result.inputs.firstName.generatedValue).toBe(true)
    expect(result.inputs.firstName.value).toBe("Charlie")
  })

  it("n'écrase pas un input existant lors de allowGeneratedValue=true", () => {
    const result = upsertForm(
      {
        inputs: {
          name: { label: "Mon nom", required: true },
        },
        allowGeneratedValue: true,
      },
      { name: "David" } as any
    )

    expect(result.inputs.name.label).toBe("Mon nom")
    expect(result.inputs.name.required).toBe(true)
  })

  it("assigne un id à chaque input qui n'en a pas", () => {
    const result = upsertForm({
      inputs: {
        field1: {},
        field2: {},
      },
    })

    expect(result.inputs.field1.id).toBeDefined()
    expect(result.inputs.field2.id).toBeDefined()
  })

  it("assigne le name de la clé si l'input n'a pas de name", () => {
    const result = upsertForm({
      inputs: {
        description: {},
      },
    })

    expect(result.inputs.description.name).toBe("description")
  })

  it("expose originalData avec la data brute passée", () => {
    const data = { id: 5, name: "Eve" } as any
    const result = upsertForm({ inputs: {} }, data)

    expect(result.originalData).toBe(data)
  })

  it("ne mute pas les inputs du formulaire précédent (hors isUpdate)", () => {
    const original = upsertForm({ inputs: { vat: {} } }, { vat: 20 } as any)

    const updated = upsertForm(original, { vat: 0 } as any)

    expect(updated.inputs.vat.value).toBe(0)
    expect(updated.inputs.vat).not.toBe(original.inputs.vat)
    expect(original.inputs.vat.value).toBe(20)
  })

  it("en mode isUpdate, met à jour les valeurs sans régénérer les ids", () => {
    const original = upsertForm({ inputs: { name: {} } }, { name: "Alice" } as any)
    const originalId = original.inputs.name.id

    const updated = upsertForm(original, { name: "Bob" } as any, { isUpdate: true })

    expect(updated.inputs.name.value).toBe("Bob")
    expect(updated.inputs.name.id).toBe(originalId)
  })
})
