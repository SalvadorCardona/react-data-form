import { describe, expect, it, vi } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import { SearchInputController } from "@/form/component/InputController/SearchInputController"
import { FormInputInterface } from "@/form/FormInputInterface"

const buildFormInput = (
  overrides: Partial<FormInputInterface> = {}
): FormInputInterface =>
  ({
    name: "title",
    label: "Recherche",
    placeholder: "Rechercher un rendez-vous...",
    ...overrides,
  }) as FormInputInterface

describe("SearchInputController", () => {
  it("affiche la valeur courante du filtre", () => {
    render(
      <SearchInputController
        formInput={buildFormInput({ value: "vaccin" })}
        onChange={vi.fn()}
      />
    )

    expect(screen.getByRole<HTMLInputElement>("textbox").value).toBe("vaccin")
  })

  it("ne propage la saisie qu'une fois, une fois la frappe terminée", async () => {
    const onChange = vi.fn()
    render(
      <SearchInputController formInput={buildFormInput()} onChange={onChange} />
    )

    const input = screen.getByRole("textbox")
    fireEvent.change(input, { target: { value: "vac" } })
    fireEvent.change(input, { target: { value: "vaccin" } })

    // Chaque frappe déclencherait sinon une requête de liste.
    expect(onChange).not.toHaveBeenCalled()

    await vi.waitFor(() => expect(onChange).toHaveBeenCalledTimes(1))
    expect(onChange.mock.calls[0][0].value).toBe("vaccin")
  })

  it("efface la recherche avec le bouton dédié", async () => {
    const onChange = vi.fn()
    render(
      <SearchInputController
        formInput={buildFormInput({ value: "vaccin" })}
        onChange={onChange}
      />
    )

    fireEvent.click(screen.getByRole("button", { name: "Effacer la recherche" }))

    expect(screen.getByRole<HTMLInputElement>("textbox").value).toBe("")

    await vi.waitFor(() => expect(onChange).toHaveBeenCalled())
    expect(onChange.mock.lastCall?.[0].value).toBe("")
  })
})
