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
  it("renders the current filter value", () => {
    render(
      <SearchInputController
        formInput={buildFormInput({ value: "vaccin" })}
        onChange={vi.fn()}
      />
    )

    expect(screen.getByRole<HTMLInputElement>("textbox").value).toBe("vaccin")
  })

  it("propagates the input only once, after typing stops", async () => {
    const onChange = vi.fn()
    render(
      <SearchInputController formInput={buildFormInput()} onChange={onChange} />
    )

    const input = screen.getByRole("textbox")
    fireEvent.change(input, { target: { value: "vac" } })
    fireEvent.change(input, { target: { value: "vaccin" } })

    // Every keystroke would otherwise fire a list request.
    expect(onChange).not.toHaveBeenCalled()

    await vi.waitFor(() => expect(onChange).toHaveBeenCalledTimes(1))
    expect(onChange.mock.calls[0][0].value).toBe("vaccin")
  })

  it("clears the search with the dedicated button", async () => {
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
