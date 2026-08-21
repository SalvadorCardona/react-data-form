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
  it("affiche l'heure de la valeur du formulaire", () => {
    const value = new Date(2026, 5, 15, 9, 30).toISOString()
    const { container } = render(
      <MomentInputController
        formInput={buildFormInput({ value })}
        onChange={vi.fn()}
      />
    )

    expect(getTimeInput(container).value).toBe("09:30")
  })

  it("met à jour l'heure affichée quand la valeur change par programme", () => {
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

  it("propage un changement d'heure en conservant la date", () => {
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

  it("ignore une saisie d'heure incomplète (valeur vide)", () => {
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

  it("laisse l'input vide pendant une saisie incomplète au lieu de rétablir l'ancienne heure", () => {
    // Bug : l'input était recollé de force sur la valeur du formulaire, donc
    // sélectionner le champ puis taper (ou effacer un segment) réaffichait
    // aussitôt l'ancienne heure et bloquait la saisie sur ce segment.
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

  it("rétablit l'heure enregistrée quand on quitte le champ sur une saisie incomplète", () => {
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
