import { describe, expect, it, vi } from "vitest"
import { act, renderHook } from "@testing-library/react"
import useForm from "@/form/hook/useForm"
import { createForm } from "@/form/utils/createForm"
import { getFormConfig, setFormConfig } from "@/form/FormConfig"

// Wrapper providing an empty FormContext, so useFormContext does not throw
const wrapper = ({ children }: { children: React.ReactNode }) => <>{children}</>

// Freezes the form state, inputs included: writing to it then throws
const deepFreeze = <T,>(value: T): T => {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value)
    Object.values(value).forEach(deepFreeze)
  }
  return value
}

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

    it("stops loading and exposes the error when asyncData rejects", async () => {
      const error = new Error("404")
      const onLoadError = vi.fn()

      const { result } = renderHook(
        () =>
          useForm({
            form: { inputs: { a: {} } },
            asyncData: () => Promise.reject(error),
            onLoadError,
          }),
        { wrapper }
      )

      await act(async () => {})

      expect(result.current.ready).toBe(true)
      expect(result.current.loadError).toBe(error)
      expect(onLoadError).toHaveBeenCalledWith(error)
      expect(result.current.form.errors).toEqual(["Unable to load the data"])
    })

    it("stops loading when form.getData rejects", async () => {
      const error = new Error("403")

      const { result } = renderHook(
        () =>
          useForm({
            form: { inputs: { a: {} }, getData: () => Promise.reject(error) },
          }),
        { wrapper }
      )

      await act(async () => {})

      expect(result.current.ready).toBe(true)
      expect(result.current.loadError).toBe(error)
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

    it("keeps both values of two changes in the same act, without mutating the state", () => {
      const handleChange = vi.fn()
      const { result } = renderHook(
        () =>
          useForm({
            form: { inputs: { start: {}, end: {} } },
            data: { start: "2026-01-01", end: "2026-01-02" },
            onChange: handleChange,
          }),
        { wrapper }
      )

      const form = deepFreeze(result.current.form)

      act(() => {
        result.current.onChange({ ...form.inputs.start, value: "2026-02-01" })
        result.current.onChange({ ...form.inputs.end, value: "2026-02-28" })
      })

      expect(result.current.form.data).toEqual({
        start: "2026-02-01",
        end: "2026-02-28",
      })
      expect(handleChange).toHaveBeenLastCalledWith(
        { start: "2026-02-01", end: "2026-02-28" },
        expect.anything()
      )
      expect(form.data).toEqual({ start: "2026-01-01", end: "2026-01-02" })
    })
  })

  describe("validate", () => {
    it("shows the violations on a new state, without mutating the previous one", () => {
      const { result } = renderHook(
        () => useForm({ form: { inputs: { name: { required: true } } } }),
        { wrapper }
      )

      const form = deepFreeze(result.current.form)

      act(() => {
        expect(result.current.validate()).toBe(false)
      })

      expect(result.current.form.inputs.name.violations).toHaveLength(1)
      expect(form.inputs.name.violations).toBeUndefined()
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

    it("waits for an asynchronous form.onSubmit before going on", async () => {
      let resolveApi: (data: any) => void = () => {}
      const handleSubmit = vi.fn()

      const { result } = renderHook(
        () =>
          useForm({
            form: {
              inputs: { name: {} },
              onSubmit: () =>
                new Promise((resolve) => {
                  resolveApi = resolve
                }),
            },
            data: { name: "Grace" },
            onSubmit: handleSubmit,
          }),
        { wrapper }
      )

      let submitting: Promise<any> = Promise.resolve()

      await act(async () => {
        submitting = result.current.onSubmit()
      })

      expect(result.current.isLoading.value).toBe(true)
      expect(handleSubmit).not.toHaveBeenCalled()

      let submittedData: any

      await act(async () => {
        resolveApi({ name: "Grace", id: 1 })
        submittedData = await submitting
      })

      expect(result.current.isLoading.value).toBe(false)
      expect(handleSubmit).toHaveBeenCalledWith({ name: "Grace", id: 1 })
      expect(submittedData).toEqual({ name: "Grace", id: 1 })
    })

    it("keeps the form data when form.onSubmit returns nothing", async () => {
      const handleSubmit = vi.fn()

      const { result } = renderHook(
        () =>
          useForm({
            form: { inputs: { name: {} }, onSubmit: async () => {} },
            data: { name: "Heidi" },
            onSubmit: handleSubmit,
          }),
        { wrapper }
      )

      await act(async () => {
        await result.current.onSubmit()
      })

      expect(handleSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Heidi" })
      )
    })

    it("stops loading and rethrows when onSubmit rejects", async () => {
      const error = new Error("500")
      const handleSuccess = vi.fn()

      const { result } = renderHook(
        () =>
          useForm({
            form: { inputs: { name: {} } },
            data: { name: "Ivan" },
            onSubmit: async () => {
              throw error
            },
          }),
        { wrapper }
      )

      result.current.onSuccess.subscribe(handleSuccess)

      let caught: unknown

      await act(async () => {
        await result.current.onSubmit().catch((e) => (caught = e))
      })

      expect(caught).toBe(error)
      expect(result.current.isLoading.value).toBe(false)
      expect(handleSuccess).not.toHaveBeenCalled()
    })

    it("stops loading and rethrows when form.onSubmit rejects", async () => {
      const error = new Error("network")

      const { result } = renderHook(
        () =>
          useForm({
            form: {
              inputs: { name: {} },
              onSubmit: async () => {
                throw error
              },
            },
            data: { name: "Judy" },
          }),
        { wrapper }
      )

      await act(async () => {
        await expect(result.current.onSubmit()).rejects.toBe(error)
      })

      expect(result.current.isLoading.value).toBe(false)
    })
  })

  describe("submission errors", () => {
    const apiError = {
      violations: [
        { propertyPath: "email", message: "Already taken" },
        { propertyPath: "", message: "Fully booked" },
      ],
    }

    it("maps the violations of a rejected onSubmit and calls onError", async () => {
      const onError = vi.fn()
      const { result } = renderHook(
        () =>
          useForm({
            form: { inputs: { email: {} } },
            data: { email: "taken@test.fr" },
            onSubmit: () => Promise.reject(apiError),
            onError,
          }),
        { wrapper }
      )

      let submitted: unknown = "unset"
      await act(async () => {
        submitted = await result.current.onSubmit()
      })

      expect(submitted).toBeUndefined()
      expect(result.current.isLoading.value).toBe(false)
      expect(result.current.form.inputs.email.violations).toEqual([
        { propertyPath: "email", message: "Already taken" },
      ])
      expect(result.current.form.errors).toEqual(["Fully booked"])
      expect(onError).toHaveBeenCalledOnce()
      expect(onError.mock.calls[0][0]).toBe(apiError)
      expect(onError.mock.calls[0][1].errors).toEqual(["Fully booked"])
    })

    it("maps the violations thrown by form.onSubmit without mutating the state", async () => {
      const { result } = renderHook(
        () =>
          useForm({
            form: deepFreeze(
              createForm({
                inputs: { email: {} },
                onSubmit: () => {
                  throw apiError
                },
              })
            ),
          }),
        { wrapper }
      )

      await act(async () => {
        await result.current.onSubmit()
      })

      expect(result.current.form.inputs.email.violations?.[0].message).toBe(
        "Already taken"
      )
    })

    it("clears the API errors on the next submission", async () => {
      const onSubmit = vi
        .fn()
        .mockRejectedValueOnce(apiError)
        .mockResolvedValueOnce(undefined)
      const { result } = renderHook(
        () => useForm({ form: { inputs: { email: {} } }, onSubmit }),
        { wrapper }
      )

      await act(async () => {
        await result.current.onSubmit()
      })
      expect(result.current.form.errors).toEqual(["Fully booked"])

      await act(async () => {
        await result.current.onSubmit()
      })
      expect(result.current.form.errors).toEqual([])
      expect(result.current.form.inputs.email.violations).toEqual([])
    })

    it("reads other formats through extractViolations", async () => {
      const { extractViolations } = getFormConfig()
      setFormConfig({
        extractViolations: (error: any) => error?.response?.data,
      })

      try {
        const { result } = renderHook(
          () =>
            useForm({
              form: { inputs: { email: {} } },
              onSubmit: () => Promise.reject({ response: { data: apiError } }),
            }),
          { wrapper }
        )

        await act(async () => {
          await result.current.onSubmit()
        })

        expect(result.current.form.inputs.email.violations?.[0].message).toBe(
          "Already taken"
        )
      } finally {
        setFormConfig({ extractViolations })
      }
    })

    it("stops loading and rethrows an error nobody handles", async () => {
      const error = new Error("Network down")
      const { result } = renderHook(
        () =>
          useForm({
            form: { inputs: { email: {} } },
            onSubmit: () => Promise.reject(error),
          }),
        { wrapper }
      )

      await act(async () => {
        await expect(result.current.onSubmit()).rejects.toBe(error)
      })

      expect(result.current.isLoading.value).toBe(false)
    })

    it("hands an error without violations to onError", async () => {
      const error = new Error("Network down")
      const onError = vi.fn()
      const { result } = renderHook(
        () =>
          useForm({
            form: { inputs: { email: {} } },
            onSubmit: () => Promise.reject(error),
            onError,
          }),
        { wrapper }
      )

      await act(async () => {
        await result.current.onSubmit()
      })

      expect(onError).toHaveBeenCalledWith(error, expect.anything())
      expect(result.current.isLoading.value).toBe(false)
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
        result.current.updateData({ name: "Grace" })
      })

      expect(result.current.form.inputs.name.value).toBe("Grace")
      expect(result.current.form.inputs.email.value).toBe("alice@test.fr")
      expect(result.current.form.data).toEqual({
        name: "Grace",
        email: "alice@test.fr",
      })
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
        result.current.updateData({ lastName: "Grace" } as any, false)
      })

      expect(result.current.form.inputs.name.value).toBe(undefined)
      expect(result.current.form.inputs.lastName.value).toBe("Grace")
    })
  })

  describe("form declaration", () => {
    it("ignores a new form object passed after the first render", () => {
      const { result, rerender } = renderHook(
        ({ required }) => useForm({ form: { inputs: { name: { required } } } }),
        { wrapper, initialProps: { required: false } }
      )

      rerender({ required: true })

      expect(result.current.form.inputs.name.required).toBe(false)
    })

    it("switches declaration through updateForm, keeping entered values", () => {
      const { result } = renderHook(
        () =>
          useForm({
            form: { inputs: { name: {}, email: {} } },
            data: { name: "Alice", email: "alice@test.fr" },
          }),
        { wrapper }
      )

      act(() => {
        result.current.updateForm({
          inputs: { name: { required: true }, age: {} },
        } as any)
      })

      expect(result.current.form.inputs.name.required).toBe(true)
      expect(result.current.form.inputs.name.value).toBe("Alice")
      expect(result.current.form.inputs.age).toBeDefined()
    })
  })

  describe("isDirty", () => {
    const renderDirtyForm = (params: Partial<Parameters<typeof useForm>[0]> = {}) =>
      renderHook(
        () =>
          useForm({
            form: {
              inputs: { name: {}, country: { defaultValue: "FR" } },
            },
            data: { id: 7, name: "Alice" },
            ...params,
          }),
        { wrapper }
      )

    const type = (
      result: ReturnType<typeof renderDirtyForm>["result"],
      value: string
    ) =>
      act(() => {
        result.current.onChange({ ...result.current.form.inputs.name, value })
      })

    it("is false on a new form, default values included", () => {
      const { result } = renderDirtyForm()

      expect(result.current.isDirty).toBe(false)
    })

    it("becomes true after a change, and false when the value comes back", () => {
      const { result } = renderDirtyForm()

      type(result, "Bob")
      expect(result.current.isDirty).toBe(true)

      type(result, "Alice")
      expect(result.current.isDirty).toBe(false)
    })

    it("is false again after reset, which puts the values back", () => {
      const onChange = vi.fn()
      const { result } = renderDirtyForm({ onChange })

      type(result, "Bob")
      act(() => {
        result.current.reset()
      })

      expect(result.current.isDirty).toBe(false)
      expect(result.current.form.inputs.name.value).toBe("Alice")
      expect(result.current.form.inputs.country.value).toBe("FR")
      expect(result.current.form.originalData).toEqual({ id: 7, name: "Alice" })
      expect(onChange).toHaveBeenLastCalledWith(
        expect.objectContaining({ name: "Alice", country: "FR" }),
        expect.anything()
      )
    })

    it("clears the violations on reset", async () => {
      const { result } = renderHook(
        () => useForm({ form: { inputs: { name: { required: true } } } }),
        { wrapper }
      )

      await act(async () => {
        await result.current.onSubmit()
      })
      expect(result.current.form.inputs.name.violations).toHaveLength(1)

      act(() => {
        result.current.reset()
      })

      expect(result.current.form.inputs.name.violations).toEqual([])
      expect(result.current.submitResult).toBeUndefined()
    })

    it("is false after a successful submission, which updates originalData", async () => {
      const { result } = renderDirtyForm({
        form: {
          inputs: { name: {} },
          onSubmit: async (data) => ({ ...data, "@id": "/users/7" }),
        },
      })

      type(result, "Bob")
      await act(async () => {
        await result.current.onSubmit()
      })

      expect(result.current.isDirty).toBe(false)
      expect(result.current.form.originalData).toEqual({
        id: 7,
        name: "Bob",
        "@id": "/users/7",
      })

      act(() => {
        result.current.reset()
      })
      expect(result.current.form.inputs.name.value).toBe("Bob")
    })

    it("stays true after a failed submission", async () => {
      const { result } = renderDirtyForm({
        form: { inputs: { name: { required: true } } },
      })

      type(result, "")
      await act(async () => {
        await result.current.onSubmit()
      })

      expect(result.current.isDirty).toBe(true)
    })

    it("compares against the data loaded by asyncData", async () => {
      const { result } = renderDirtyForm({
        asyncData: vi.fn().mockResolvedValue({ name: "Charlie" }),
      })

      await act(async () => {})

      expect(result.current.form.inputs.name.value).toBe("Charlie")
      expect(result.current.isDirty).toBe(false)
    })
  })

  describe("warnOnLeave", () => {
    const leave = () => {
      const event = new Event("beforeunload", { cancelable: true })
      window.dispatchEvent(event)
      return event
    }

    it("blocks leaving the page only while the form is dirty", () => {
      const { result, unmount } = renderHook(
        () =>
          useForm({
            form: { inputs: { name: {} } },
            data: { name: "Alice" },
            warnOnLeave: true,
          }),
        { wrapper }
      )

      expect(leave().defaultPrevented).toBe(false)

      act(() => {
        result.current.onChange({ ...result.current.form.inputs.name, value: "Bob" })
      })
      expect(leave().defaultPrevented).toBe(true)

      act(() => {
        result.current.reset()
      })
      expect(leave().defaultPrevented).toBe(false)

      act(() => {
        result.current.onChange({ ...result.current.form.inputs.name, value: "Bob" })
      })
      unmount()
      expect(leave().defaultPrevented).toBe(false)
    })

    it("does nothing without the option", () => {
      const { result } = renderHook(
        () => useForm({ form: { inputs: { name: {} } }, data: { name: "Alice" } }),
        { wrapper }
      )

      act(() => {
        result.current.onChange({ ...result.current.form.inputs.name, value: "Bob" })
      })

      expect(leave().defaultPrevented).toBe(false)
    })
  })
})
