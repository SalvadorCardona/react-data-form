import { describe, expect, it, vi } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import { ColorInputController } from "@/form/component/InputController/ColorInputController"
import { FormInputInterface } from "@/form/FormInputInterface"
import FormElement from "@/form/component/form/FormElement"
import useForm from "@/form/hook/useForm"

const buildFormInput = (
  overrides: Partial<FormInputInterface<string | null | undefined>> = {}
): FormInputInterface<string | null | undefined> => ({
  name: "color",
  ...overrides,
})

const palette = [
  { label: "Red", value: "#ef4444" },
  { label: "Blue", value: "#3B82F6" },
]

describe("ColorInputController", () => {
  it("stores the picked color", () => {
    const onChange = vi.fn()
    const { container } = render(
      <ColorInputController formInput={buildFormInput()} onChange={onChange} />
    )

    fireEvent.change(container.querySelector('input[type="color"]')!, {
      target: { value: "#112233" },
    })

    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ value: "#112233" })
    )
    expect(screen.getByRole("textbox", { name: "Hexadecimal code" })).toHaveValue(
      "#112233"
    )
  })

  it.each([
    ["a full code", "#AABBCC", "#aabbcc"],
    ["a short code", "#abc", "#aabbcc"],
    ["a code without #", "1a2b3c", "#1a2b3c"],
  ])("stores %s typed in the hexadecimal field as #rrggbb", (_, typed, stored) => {
    const onChange = vi.fn()
    render(<ColorInputController formInput={buildFormInput()} onChange={onChange} />)

    fireEvent.change(screen.getByRole("textbox"), { target: { value: typed } })

    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ value: stored })
    )
  })

  it("keeps an incomplete code on screen without storing it", () => {
    const onChange = vi.fn()
    render(
      <ColorInputController
        formInput={buildFormInput({ value: "#000000" })}
        onChange={onChange}
      />
    )

    const hex = screen.getByRole("textbox")
    fireEvent.change(hex, { target: { value: "#12" } })

    expect(hex).toHaveValue("#12")
    expect(onChange).not.toHaveBeenCalled()
  })

  it("refuses characters that cannot be part of a code", () => {
    const onChange = vi.fn()
    render(<ColorInputController formInput={buildFormInput()} onChange={onChange} />)

    const hex = screen.getByRole("textbox")
    fireEvent.change(hex, { target: { value: "#zz" } })

    expect(hex).toHaveValue("")
    expect(onChange).not.toHaveBeenCalled()
  })

  it("stores null once the hexadecimal field is emptied", () => {
    const onChange = vi.fn()
    render(
      <ColorInputController
        formInput={buildFormInput({ value: "#ffffff" })}
        onChange={onChange}
      />
    )

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "" } })

    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ value: null })
    )
  })

  it("offers valueOptions as a palette", () => {
    const onChange = vi.fn()
    render(
      <ColorInputController
        formInput={buildFormInput({ value: "#ef4444", valueOptions: palette })}
        onChange={onChange}
      />
    )

    expect(screen.getByRole("button", { name: "Red" })).toHaveAttribute(
      "aria-pressed",
      "true"
    )
    fireEvent.click(screen.getByRole("button", { name: "Blue" }))

    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ value: "#3b82f6" })
    )
  })

  it("renders a swatch and the code when read-only", () => {
    const { container, rerender } = render(
      <ColorInputController
        formInput={buildFormInput({
          value: "#3b82f6",
          valueOptions: palette,
          readonly: true,
        })}
        onChange={vi.fn()}
      />
    )

    expect(screen.getByText("#3b82f6")).toBeInTheDocument()
    expect(container.querySelector("input")).toBeNull()
    expect(screen.queryByRole("button")).toBeNull()

    rerender(
      <ColorInputController
        formInput={buildFormInput({ value: null, readonly: true })}
        onChange={vi.fn()}
      />
    )
    expect(screen.getByText("-")).toBeInTheDocument()
  })

  it("ties the color input to the field label in a form", () => {
    function Form() {
      const formContext = useForm({
        form: {
          inputs: { color: { label: "Color", controller: ColorInputController } },
          onSubmit: (data) => data,
        },
      })
      return <FormElement {...formContext} />
    }
    render(<Form />)

    expect(screen.getByLabelText("Color")).toHaveAttribute("type", "color")
  })
})
