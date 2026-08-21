import { describe, expect, it, vi } from "vitest"
import { act, renderHook } from "@testing-library/react"
import useForm from "@/form/hook/useForm"

// Wrapper providing an empty FormContext, so useFormContext does not throw
const wrapper = ({ children }: { children: React.ReactNode }) => <>{children}</>

describe("useForm", () => {
  describe("initialisation", () => {
    it("creates a form from the given inputs", () => {
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

    it("initialises the values from data", () => {
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

    it("is ready when neither asyncData nor getData is provided", async () => {
      const { result } = renderHook(
        () => useForm({ form: { inputs: { name: {} } } }),
        { wrapper }
      )

      // useEffect runs after the render
      await act(async () => {})

      expect(result.current.ready).toBe(true)
    })

    it("loads async data then becomes ready", async () => {
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
    it("updates an input value on change", () => {
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

    it("calls the onChange callback with the new data", () => {
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

    it("ignores changes on a readonly input", () => {
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
    it("calls the onSubmit callback with the form data", async () => {
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

    it("does not call onSubmit when an input carries a violation", async () => {
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

    it("renders the violations after an invalid submit", async () => {
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

    it("returns the submitted data", async () => {
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
    it("updates the form data partially", () => {
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

    it("replaces the form data entirely", () => {
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
