import { describe, expect, it, vi } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import { DurationInputController } from "@/form/component/InputController/DurationInputController"
import { FormInputInterface } from "@/form/FormInputInterface"

const buildFormInput = (
  overrides: Partial<FormInputInterface<number | undefined | null>> = {}
): FormInputInterface<number | undefined | null> => ({
  name: "duration",
  ...overrides,
})

const getHoursInput = () => screen.getByLabelText("Heures") as HTMLInputElement
const getMinutesInput = () => screen.getByLabelText("Minutes") as HTMLInputElement

describe("DurationInputController", () => {
  it("affiche des champs vides quand la valeur est null/undefined", () => {
    const { rerender } = render(
      <DurationInputController
        formInput={buildFormInput({ value: null })}
        onChange={vi.fn()}
      />
    )
    expect(getHoursInput()).toHaveValue("")
    expect(getMinutesInput()).toHaveValue("")

    rerender(
      <DurationInputController
        formInput={buildFormInput({ value: undefined })}
        onChange={vi.fn()}
      />
    )
    expect(getHoursInput()).toHaveValue("")
    expect(getMinutesInput()).toHaveValue("")
  })

  it("convertit les secondes en heures et minutes", () => {
    render(
      <DurationInputController
        formInput={buildFormInput({ value: 3 * 3600 + 30 * 60 })}
        onChange={vi.fn()}
      />
    )
    expect(getHoursInput()).toHaveValue("3")
    expect(getMinutesInput()).toHaveValue("30")
  })

  it("convertit la saisie heures+minutes en secondes", () => {
    const onChange = vi.fn()
    render(
      <DurationInputController
        formInput={buildFormInput({ value: null })}
        onChange={onChange}
      />
    )

    fireEvent.change(getHoursInput(), { target: { value: "2" } })
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ value: 2 * 3600 })
    )

    fireEvent.change(getMinutesInput(), { target: { value: "45" } })
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ value: 2 * 3600 + 45 * 60 })
    )
  })

  it("autorise les durées au-delà de 24h", () => {
    const onChange = vi.fn()
    render(
      <DurationInputController
        formInput={buildFormInput({ value: null })}
        onChange={onChange}
      />
    )

    fireEvent.change(getHoursInput(), { target: { value: "100" } })
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ value: 100 * 3600 })
    )
  })

  it("rejette les minutes supérieures à 59", () => {
    const onChange = vi.fn()
    render(
      <DurationInputController
        formInput={buildFormInput({ value: 0 })}
        onChange={onChange}
      />
    )

    fireEvent.change(getMinutesInput(), { target: { value: "60" } })
    expect(getMinutesInput()).toHaveValue("0")
    expect(onChange).not.toHaveBeenCalled()
  })

  it("rejette les caractères non numériques", () => {
    const onChange = vi.fn()
    render(
      <DurationInputController
        formInput={buildFormInput({ value: 60 })}
        onChange={onChange}
      />
    )

    fireEvent.change(getHoursInput(), { target: { value: "abc" } })
    expect(onChange).not.toHaveBeenCalled()
  })

  it("retourne null quand les deux champs sont vides", () => {
    const onChange = vi.fn()
    render(
      <DurationInputController
        formInput={buildFormInput({ value: 3600 })}
        onChange={onChange}
      />
    )

    fireEvent.change(getMinutesInput(), { target: { value: "" } })
    fireEvent.change(getHoursInput(), { target: { value: "" } })

    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ value: null })
    )
  })

  it("se synchronise quand la valeur externe change", () => {
    const { rerender } = render(
      <DurationInputController
        formInput={buildFormInput({ value: 3600 })}
        onChange={vi.fn()}
      />
    )
    expect(getHoursInput()).toHaveValue("1")
    expect(getMinutesInput()).toHaveValue("0")

    rerender(
      <DurationInputController
        formInput={buildFormInput({ value: 5400 })}
        onChange={vi.fn()}
      />
    )
    expect(getHoursInput()).toHaveValue("1")
    expect(getMinutesInput()).toHaveValue("30")
  })

  it("affiche la durée formatée en mode readonly", () => {
    render(
      <DurationInputController
        formInput={buildFormInput({
          value: 2 * 3600 + 15 * 60,
          readonly: true,
        })}
        onChange={vi.fn()}
      />
    )
    expect(screen.queryByLabelText("Heures")).not.toBeInTheDocument()
    expect(screen.getByText("2h 15min")).toBeInTheDocument()
  })
})
