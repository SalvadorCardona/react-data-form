import { describe, expect, it, vi } from "vitest"
import { fireEvent, render } from "@testing-library/react"
import { MomentInputController } from "@/form/component/InputController/MomentInputController"
import { FormInputInterface } from "@/form/FormInputInterface"

const buildFormInput = (
  overrides: Partial<FormInputInterface<string | null | undefined>> = {}
): FormInputInterface<string | null | undefined> => ({
  name: "startDate",
  ...overrides,
})

const getTimeInput = (container: HTMLElement): HTMLInputElement => {
  const input = container.querySelector<HTMLInputElement>('input[type="time"]')
  if (!input) throw new Error("time input not found")
  return input
}

describe("MomentInputController", () => {
  it("renders the time held by the form value", () => {
    const value = new Date(2026, 5, 15, 9, 30).toISOString()
    const { container } = render(
      <MomentInputController
        formInput={buildFormInput({ value })}
        onChange={vi.fn()}
      />
    )

    expect(getTimeInput(container).value).toBe("09:30")
  })

  it("updates the displayed time when the value changes programmatically", () => {
    const before = new Date(2026, 5, 15, 10, 0).toISOString()
    const after = new Date(2026, 5, 15, 15, 45).toISOString()

    const { container, rerender } = render(
      <MomentInputController
        formInput={buildFormInput({ value: before })}
        onChange={vi.fn()}
      />
    )
    expect(getTimeInput(container).value).toBe("10:00")

    rerender(
      <MomentInputController
        formInput={buildFormInput({ value: after })}
        onChange={vi.fn()}
      />
    )

    expect(getTimeInput(container).value).toBe("15:45")
  })

  it("propagates a time change while keeping the date", () => {
    const value = new Date(2026, 5, 15, 9, 0).toISOString()
    const onChange = vi.fn()
    const { container } = render(
      <MomentInputController
        formInput={buildFormInput({ value })}
        onChange={onChange}
      />
    )

    fireEvent.change(getTimeInput(container), { target: { value: "14:30" } })

    expect(onChange).toHaveBeenCalledOnce()
    const nextValue = new Date(onChange.mock.calls[0][0].value)
    expect(nextValue.getFullYear()).toBe(2026)
    expect(nextValue.getMonth()).toBe(5)
    expect(nextValue.getDate()).toBe(15)
    expect(nextValue.getHours()).toBe(14)
    expect(nextValue.getMinutes()).toBe(30)
  })

  it("ignores an incomplete time entry", () => {
    const value = new Date(2026, 5, 15, 9, 0).toISOString()
    const onChange = vi.fn()
    const { container } = render(
      <MomentInputController
        formInput={buildFormInput({ value })}
        onChange={onChange}
      />
    )

    fireEvent.change(getTimeInput(container), { target: { value: "" } })

    expect(onChange).not.toHaveBeenCalled()
  })

  it("leaves the input empty while typing instead of restoring the previous time", () => {
    // Regression: the input used to be forced back onto the form value, so
    // selecting the field then typing (or clearing a segment) immediately
    // restored the previous time and froze that segment.
    const value = new Date(2026, 5, 15, 9, 0).toISOString()
    const { container } = render(
      <MomentInputController
        formInput={buildFormInput({ value })}
        onChange={vi.fn()}
      />
    )

    fireEvent.change(getTimeInput(container), { target: { value: "" } })

    expect(getTimeInput(container).value).toBe("")
  })

  it("restores the stored time when leaving the field on an incomplete entry", () => {
    const value = new Date(2026, 5, 15, 9, 0).toISOString()
    const { container } = render(
      <MomentInputController
        formInput={buildFormInput({ value })}
        onChange={vi.fn()}
      />
    )

    fireEvent.change(getTimeInput(container), { target: { value: "" } })
    fireEvent.blur(getTimeInput(container))

    expect(getTimeInput(container).value).toBe("09:00")
  })
})
