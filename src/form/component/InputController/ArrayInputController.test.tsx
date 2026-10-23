import { describe, expect, it, vi } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import { ArrayInputController } from "@/form/component/InputController/ArrayInputController"
import { FormInputInterface } from "@/form/FormInputInterface"

const buildFormInput = (
  overrides: Partial<FormInputInterface<string[]>> = {}
): FormInputInterface<string[]> =>
  ({
    name: "tags",
    label: "Tags",
    ...overrides,
  }) as FormInputInterface<string[]>

const getTextInput = () => screen.getByRole<HTMLInputElement>("textbox")

describe("ArrayInputController", () => {
  it("adds the value on Enter without submitting the form, then clears the input", () => {
    const onChange = vi.fn()
    render(<ArrayInputController formInput={buildFormInput()} onChange={onChange} />)
    const input = getTextInput()

    fireEvent.change(input, { target: { value: "foo" } })
    const notCancelled = fireEvent.keyDown(input, { key: "Enter" })

    expect(notCancelled).toBe(false)
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ name: "tags", value: ["foo"] })
    )
    expect(input.value).toBe("")
    expect(screen.getByText("foo")).toBeTruthy()
  })

  it("adds the value with an accessible button", () => {
    const onChange = vi.fn()
    render(<ArrayInputController formInput={buildFormInput()} onChange={onChange} />)

    fireEvent.change(getTextInput(), { target: { value: "bar" } })
    const button = screen.getByRole("button", { name: "Add" })
    expect(button.getAttribute("type")).toBe("button")
    fireEvent.click(button)

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ value: ["bar"] })
    )
    expect(getTextInput().value).toBe("")
  })

  it("removes a value with a keyboard-focusable button", () => {
    const onChange = vi.fn()
    render(
      <ArrayInputController
        formInput={buildFormInput({ value: ["foo", "bar"] })}
        onChange={onChange}
      />
    )

    const remove = screen.getByRole("button", { name: "Remove foo" })
    expect(remove.getAttribute("type")).toBe("button")
    remove.focus()
    expect(document.activeElement).toBe(remove)
    fireEvent.click(remove)

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ value: ["bar"] })
    )
    expect(screen.queryByText("foo")).toBeNull()
  })

  it("keeps the typed text and shows a translatable error below min", () => {
    const onChange = vi.fn()
    render(
      <ArrayInputController
        formInput={buildFormInput({ min: 3 })}
        onChange={onChange}
      />
    )

    fireEvent.change(getTextInput(), { target: { value: "ab" } })
    fireEvent.keyDown(getTextInput(), { key: "Enter" })

    expect(onChange).not.toHaveBeenCalled()
    expect(getTextInput().value).toBe("ab")
    expect(screen.getByText("Minimum 3 characters")).toBeTruthy()
  })

  it("only shows the tags in readonly mode", () => {
    render(
      <ArrayInputController
        formInput={buildFormInput({ value: ["foo"], readonly: true })}
        onChange={vi.fn()}
      />
    )

    expect(screen.getByText("foo")).toBeTruthy()
    expect(screen.queryByRole("textbox")).toBeNull()
    expect(screen.queryByRole("button")).toBeNull()
  })

  it("follows formInput.value", () => {
    const { rerender } = render(
      <ArrayInputController
        formInput={buildFormInput({ value: ["foo"] })}
        onChange={vi.fn()}
      />
    )

    rerender(
      <ArrayInputController
        formInput={buildFormInput({ value: ["bar"] })}
        onChange={vi.fn()}
      />
    )

    expect(screen.queryByText("foo")).toBeNull()
    expect(screen.getByText("bar")).toBeTruthy()
  })
})
