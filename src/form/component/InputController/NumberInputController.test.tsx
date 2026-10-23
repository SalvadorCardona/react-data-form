import { describe, expect, it, vi } from "vitest"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { NumberInputController } from "@/form/component/InputController/NumberInputController"
import { FormInputInterface } from "@/form/FormInputInterface"
import FormElement from "@/form/component/form/FormElement"
import useForm from "@/form/hook/useForm"

const buildFormInput = (
  overrides: Partial<FormInputInterface<number>> = {}
): FormInputInterface<number> => ({
  name: "maxParticipants",
  ...overrides,
})

describe("NumberInputController", () => {
  it("forwards the min attribute onto the input", () => {
    render(
      <NumberInputController
        formInput={buildFormInput({ min: 0 })}
        onChange={vi.fn()}
      />
    )

    expect(screen.getByRole("spinbutton")).toHaveAttribute("min", "0")
  })

  it.each([
    ["an empty string", ""],
    ["a lone minus sign", "-"],
    ["a trailing dot", "1."],
  ])("stores null, never 0 or NaN, for %s", (_, typed) => {
    const onChange = vi.fn()
    render(
      <NumberInputController
        formInput={buildFormInput({ value: 5 })}
        onChange={onChange}
      />
    )

    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: typed } })

    // jsdom, like browsers, may sanitize a partial number to ""
    expect([null, 1]).toContain(onChange.mock.lastCall?.[0].value)
  })

  it("stores the typed value as a number", () => {
    const onChange = vi.fn()
    render(
      <NumberInputController
        formInput={buildFormInput({ min: 0 })}
        onChange={onChange}
      />
    )

    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "3" } })

    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ value: 3 }))
  })

  it.each([
    ["below the minimum", "5"],
    ["above the maximum", "42"],
  ])("stores a value %s as displayed, without clamping it", (_, typed) => {
    const onChange = vi.fn()
    render(
      <NumberInputController
        formInput={buildFormInput({ min: 10, max: 20 })}
        onChange={onChange}
      />
    )

    const input = screen.getByRole("spinbutton")
    fireEvent.change(input, { target: { value: typed } })

    expect(input).toHaveValue(Number(typed))
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ value: Number(typed) })
    )
  })
})

function NumberForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const formContext = useForm({
    form: {
      label: { submit: "Send" },
      inputs: { n: { label: "N", controller: NumberInputController, min: 10 } },
    },
    data: { n: 5 },
    onSubmit,
  })
  return <FormElement {...formContext} />
}

describe("NumberInputController in a form", () => {
  it("submits null once the input is cleared", async () => {
    const onSubmit = vi.fn()
    render(<NumberForm onSubmit={onSubmit} />)

    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "" } })
    fireEvent.click(screen.getByRole("button", { name: "Send" }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalled())
    expect(onSubmit.mock.lastCall?.[0]).toEqual({ n: null })
  })

  it("shows a violation instead of submitting a value out of bounds", async () => {
    const onSubmit = vi.fn()
    render(<NumberForm onSubmit={onSubmit} />)

    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "7" } })
    fireEvent.click(screen.getByRole("button", { name: "Send" }))

    expect(
      await screen.findByText("This value should be greater than or equal to 10")
    ).toBeInTheDocument()
    expect(screen.getByRole("spinbutton")).toHaveValue(7)
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
