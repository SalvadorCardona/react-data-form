import { describe, expect, it, vi } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import { NumberInputController } from "@/form/component/InputController/NumberInputController"
import { FormInputInterface } from "@/form/FormInputInterface"

const buildFormInput = (
  overrides: Partial<FormInputInterface<number>> = {}
): FormInputInterface<number> => ({
  name: "maxParticipants",
  ...overrides,
})

describe("NumberInputController", () => {
  it("propage l'attribut min sur l'input", () => {
    render(
      <NumberInputController
        formInput={buildFormInput({ min: 0 })}
        onChange={vi.fn()}
      />
    )

    expect(screen.getByRole("spinbutton")).toHaveAttribute("min", "0")
  })

  it("ramène une saisie négative à la valeur minimale", () => {
    const onChange = vi.fn()
    render(
      <NumberInputController
        formInput={buildFormInput({ min: 0 })}
        onChange={onChange}
      />
    )

    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "-5" } })

    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ value: 0 }))
  })

  it("laisse passer une valeur supérieure ou égale au minimum", () => {
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

  it("plafonne une saisie au-dessus du maximum", () => {
    const onChange = vi.fn()
    render(
      <NumberInputController
        formInput={buildFormInput({ min: 0, max: 10 })}
        onChange={onChange}
      />
    )

    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "42" } })

    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ value: 10 }))
  })
})
