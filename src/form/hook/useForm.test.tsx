import { describe, expect, it, vi } from "vitest"
import { act, renderHook } from "@testing-library/react"
import useForm from "@/form/hook/useForm"

// Wrapper pour fournir un FormContext vide (évite l'erreur useFormContext)
const wrapper = ({ children }: { children: React.ReactNode }) => <>{children}</>

describe("useForm", () => {
  describe("initialisation", () => {
    it("crée un formulaire avec les inputs définis", () => {
      const { result } = renderHook(
        () =>
          useForm({
            form: {
              inputs: {
                name: {},
                email: {},
              },
            },
            data: { name: "Alice", email: "alice@test.fr" },
          }),
        { wrapper }
      )

      expect(result.current.form.inputs.name).toBeDefined()
      expect(result.current.form.inputs.email).toBeDefined()
    })

    it("initialise les valeurs depuis data", () => {
      const { result } = renderHook(
        () =>
          useForm({
            form: { inputs: { name: {}, age: {} } },
            data: { name: "Bob", age: 25 },
          }),
        { wrapper }
      )

      expect(result.current.form.inputs.name.value).toBe("Bob")
      expect(result.current.form.inputs.age.value).toBe(25)
    })

    it("est prêt (ready=true) si aucun asyncData ni getData n'est fourni", async () => {
      const { result } = renderHook(
        () => useForm({ form: { inputs: { name: {} } } }),
        { wrapper }
      )

      // useEffect s'exécute après le rendu
      await act(async () => {})

      expect(result.current.ready).toBe(true)
    })

    it("charge les données async et devient ready", async () => {
      const asyncData = vi.fn().mockResolvedValue({ name: "Charlie" })

      const { result } = renderHook(
        () =>
          useForm({
            form: { inputs: { name: {} } },
            asyncData,
          }),
        { wrapper }
      )

      expect(result.current.ready).toBe(false)

      await act(async () => {})

      expect(asyncData).toHaveBeenCalledOnce()
      expect(result.current.ready).toBe(true)
      expect(result.current.form.inputs.name.value).toBe("Charlie")
    })
  })

  describe("onChange", () => {
    it("met à jour la valeur d'un input lors d'un changement", () => {
      const { result } = renderHook(
        () =>
          useForm({
            form: { inputs: { name: {} } },
            data: { name: "Alice" },
          }),
        { wrapper }
      )

      act(() => {
        result.current.onChange({
          ...result.current.form.inputs.name,
          value: "David",
        })
      })

      expect(result.current.form.inputs.name.value).toBe("David")
    })

    it("appelle le callback onChange avec les nouvelles données", () => {
      const handleChange = vi.fn()

      const { result } = renderHook(
        () =>
          useForm({
            form: { inputs: { name: {} } },
            data: { name: "Alice" },
            onChange: handleChange,
          }),
        { wrapper }
      )

      act(() => {
        result.current.onChange({
          ...result.current.form.inputs.name,
          value: "Eve",
        })
      })

      expect(handleChange).toHaveBeenCalled()
    })

    it("ignore les changements sur un input readonly", () => {
      const { result } = renderHook(
        () =>
          useForm({
            form: { inputs: { name: { readonly: true } } },
            data: { name: "Alice" },
          }),
        { wrapper }
      )

      const originalValue = result.current.form.inputs.name.value

      act(() => {
        result.current.onChange({
          ...result.current.form.inputs.name,
          value: "Should not change",
        })
      })

      expect(result.current.form.inputs.name.value).toBe(originalValue)
    })
  })

  describe("onSubmit", () => {
    it("appelle le callback onSubmit avec les données du formulaire", async () => {
      const handleSubmit = vi.fn().mockResolvedValue(undefined)

      const { result } = renderHook(
        () =>
          useForm({
            form: { inputs: { name: {} } },
            data: { name: "Alice" },
            onSubmit: handleSubmit,
          }),
        { wrapper }
      )

      await act(async () => {
        await result.current.onSubmit()
      })

      expect(handleSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Alice" })
      )
    })

    it("n'appelle pas onSubmit si un input a une violation", async () => {
      const handleSubmit = vi.fn()

      const { result } = renderHook(
        () =>
          useForm({
            form: {
              inputs: {
                email: {
                  value: "invalid",
                  validator: (v) => {
                    if (!(v as string).includes("@"))
                      throw new Error("Email invalide")
                  },
                },
              },
            },
            onSubmit: handleSubmit,
          }),
        { wrapper }
      )

      await act(async () => {
        await result.current.onSubmit()
      })

      expect(handleSubmit).not.toHaveBeenCalled()
    })

    it("affiche les violations après un submit invalide", async () => {
      const { result } = renderHook(
        () =>
          useForm({
            form: {
              inputs: {
                email: {
                  validator: (v) => {
                    if (!(v as string).includes("@"))
                      throw new Error("Email invalide")
                  },
                },
              },
            },
            data: { email: "not-an-email" },
          }),
        { wrapper }
      )

      await act(async () => {
        await result.current.onSubmit()
      })

      expect(result.current.form.inputs.email.violations).toHaveLength(1)
      expect(result.current.form.inputs.email.violations![0].message).toBe(
        "Email invalide"
      )
    })

    it("retourne les données soumises", async () => {
      const { result } = renderHook(
        () =>
          useForm({
            form: { inputs: { name: {} } },
            data: { name: "Frank" },
          }),
        { wrapper }
      )

      let submittedData: any

      await act(async () => {
        submittedData = await result.current.onSubmit()
      })

      expect(submittedData).toMatchObject({ name: "Frank" })
    })
  })

  describe("updateData", () => {
    it("met à jour les données du formulaire de façon partielle", () => {
      const { result } = renderHook(
        () =>
          useForm({
            form: { inputs: { name: {}, email: {} } },
            data: { name: "Alice", email: "alice@test.fr" },
          }),
        { wrapper }
      )

      act(() => {
        result.current.updateData({ name: "Grace" } as any)
      })

      expect(result.current.form.inputs.name.value).toBe("Grace")
    })

    it("met à jour les données du formulaire de façon non partielle", () => {
      const { result } = renderHook(
        () =>
          useForm({
            form: { inputs: { name: {}, email: {} } },
            data: { name: "Alice", email: "alice@test.fr" },
          }),
        { wrapper }
      )

      act(() => {
        result.current.updateData({ lastName: "Grace" } as any)
      })

      expect(result.current.form.inputs.name.value).toBe(undefined)
      expect(result.current.form.inputs.lastName.value).toBe("Grace")
    })
  })
})
