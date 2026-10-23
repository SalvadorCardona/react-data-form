import { describe, expect, it, vi } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import {
  SliderFormInputInterface,
  SliderInputController,
} from "@/form/component/InputController/SliderInputController"
import FormElement from "@/form/component/form/FormElement"
import useForm from "@/form/hook/useForm"

const buildFormInput = (
  overrides: Partial<SliderFormInputInterface> = {}
): SliderFormInputInterface => ({
  name: "volume",
  ...overrides,
})

// Base UI keeps the thumbs hidden until it has measured the track, which jsdom
// never does: the sliders are queried with `hidden: true`, and their names
// read from aria-labelledby, which jsdom leaves empty on a hidden element.
const sliders = () => screen.getAllByRole("slider", { hidden: true })

const labelOf = (element: HTMLElement) =>
  (element.getAttribute("aria-labelledby") ?? "")
    .split(" ")
    .map((id) => document.getElementById(id)?.textContent?.trim())
    .filter(Boolean)
    .join(" ")

describe("SliderInputController", () => {
  it("forwards min, max and the value onto the slider", () => {
    render(
      <SliderInputController
        formInput={buildFormInput({ min: 10, max: 20, value: 15 })}
        onChange={vi.fn()}
      />
    )

    const slider = screen.getByRole("slider", { hidden: true })
    expect(slider).toHaveAttribute("min", "10")
    expect(slider).toHaveAttribute("max", "20")
    expect(slider).toHaveAttribute("aria-valuenow", "15")
    expect(screen.getByRole("status")).toHaveTextContent("15")
  })

  it("moves by step with the keyboard", () => {
    const onChange = vi.fn()
    render(
      <SliderInputController
        formInput={buildFormInput({ step: 5, value: 40 })}
        onChange={onChange}
      />
    )

    fireEvent.keyDown(screen.getByRole("slider", { hidden: true }), {
      key: "ArrowRight",
    })

    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ value: 45 }))
  })

  it("never goes past max", () => {
    const onChange = vi.fn()
    render(
      <SliderInputController
        formInput={buildFormInput({ min: 0, max: 10, value: 10 })}
        onChange={onChange}
      />
    )

    fireEvent.keyDown(screen.getByRole("slider", { hidden: true }), {
      key: "ArrowRight",
    })
    fireEvent.keyDown(screen.getByRole("slider", { hidden: true }), { key: "End" })

    for (const [formInput] of onChange.mock.calls) {
      expect(formInput.value).toBeLessThanOrEqual(10)
    }
  })

  it("never goes below min", () => {
    const onChange = vi.fn()
    render(
      <SliderInputController
        formInput={buildFormInput({ min: 5, max: 10, value: 5 })}
        onChange={onChange}
      />
    )

    fireEvent.keyDown(screen.getByRole("slider", { hidden: true }), {
      key: "ArrowLeft",
    })

    for (const [formInput] of onChange.mock.calls) {
      expect(formInput.value).toBeGreaterThanOrEqual(5)
    }
  })

  it("rests on min and shows no value while empty", () => {
    render(
      <SliderInputController
        formInput={buildFormInput({ min: 3, max: 9 })}
        onChange={vi.fn()}
      />
    )

    expect(screen.getByRole("slider", { hidden: true })).toHaveAttribute(
      "aria-valuenow",
      "3"
    )
    expect(screen.getByRole("status")).toHaveTextContent("-")
  })

  it("stores a [start, end] pair with range, each thumb named", () => {
    const onChange = vi.fn()
    render(
      <SliderInputController
        formInput={buildFormInput({
          id: "budget",
          range: true,
          max: 1000,
          step: 50,
          value: [200, 600],
        })}
        onChange={onChange}
      />
    )

    const [start, end] = sliders()
    expect(labelOf(start)).toBe("Minimum")
    expect(labelOf(end)).toBe("Maximum")
    expect(start).toHaveAttribute("aria-valuenow", "200")
    expect(screen.getByRole("status")).toHaveTextContent("200 – 600")

    fireEvent.keyDown(end, { key: "ArrowRight" })

    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ value: [200, 650] })
    )
  })

  it("renders the value as text when read-only", () => {
    const { rerender } = render(
      <SliderInputController
        formInput={buildFormInput({ value: 42, readonly: true })}
        onChange={vi.fn()}
      />
    )

    expect(screen.queryByRole("slider", { hidden: true })).not.toBeInTheDocument()
    expect(screen.getByText("42")).toBeInTheDocument()

    rerender(
      <SliderInputController
        formInput={buildFormInput({ range: true, value: [1, 3], readonly: true })}
        onChange={vi.fn()}
      />
    )
    expect(screen.getByText("1 – 3")).toBeInTheDocument()
  })

  it("is named after the field label in a form", () => {
    function Form() {
      const formContext = useForm({
        form: {
          inputs: {
            volume: { label: "Volume", controller: SliderInputController },
          },
          onSubmit: (data) => data,
        },
      })
      return <FormElement {...formContext} />
    }
    render(<Form />)

    expect(labelOf(sliders()[0])).toBe("Volume")
  })
})
