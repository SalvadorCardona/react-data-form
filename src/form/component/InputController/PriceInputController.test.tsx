import { describe, expect, it, vi } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import { PriceInputController } from "@/form/component/InputController/PriceInputController"
import { FormInputInterface } from "@/form/FormInputInterface"

const buildFormInput = (
  overrides: Partial<FormInputInterface<number | undefined | null>> = {}
): FormInputInterface<number | undefined | null> => ({
  name: "price",
  ...overrides,
})

describe("PriceInputController", () => {
  it("affiche une chaîne vide quand la valeur est null/undefined/NaN", () => {
    const { rerender } = render(
      <PriceInputController
        formInput={buildFormInput({ value: null })}
        onChange={vi.fn()}
      />
    )
    expect(screen.getByRole("textbox")).toHaveValue("")

    rerender(
      <PriceInputController
        formInput={buildFormInput({ value: undefined })}
        onChange={vi.fn()}
      />
    )
    expect(screen.getByRole("textbox")).toHaveValue("")

    rerender(
      <PriceInputController
        formInput={buildFormInput({ value: NaN })}
        onChange={vi.fn()}
      />
    )
    expect(screen.getByRole("textbox")).toHaveValue("")
  })

  it("affiche la valeur des centimes en euros avec une virgule", () => {
    render(
      <PriceInputController
        formInput={buildFormInput({ value: 1250 })}
        onChange={vi.fn()}
      />
    )
    expect(screen.getByRole("textbox")).toHaveValue("12,5")
  })

  it("convertit une saisie avec virgule en centimes", () => {
    const onChange = vi.fn()
    render(
      <PriceInputController
        formInput={buildFormInput({ value: null })}
        onChange={onChange}
      />
    )

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "12,50" },
    })

    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ value: 1250 })
    )
    expect(screen.getByRole("textbox")).toHaveValue("12,50")
  })

  it("convertit une saisie avec point en centimes", () => {
    const onChange = vi.fn()
    render(
      <PriceInputController
        formInput={buildFormInput({ value: null })}
        onChange={onChange}
      />
    )

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "12.50" },
    })

    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ value: 1250 })
    )
  })

  it("autorise la saisie progressive d'une valeur décimale (12,)", () => {
    const onChange = vi.fn()
    render(
      <PriceInputController
        formInput={buildFormInput({ value: null })}
        onChange={onChange}
      />
    )

    const input = screen.getByRole("textbox")
    fireEvent.change(input, { target: { value: "12" } })
    fireEvent.change(input, { target: { value: "12," } })

    expect(input).toHaveValue("12,")
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ value: 1200 })
    )
  })

  it("retourne null sur une saisie vide", () => {
    const onChange = vi.fn()
    render(
      <PriceInputController
        formInput={buildFormInput({ value: 1000 })}
        onChange={onChange}
      />
    )

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "" } })

    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ value: null })
    )
  })

  it("ne produit jamais NaN, même avec une saisie ne contenant que la virgule", () => {
    const onChange = vi.fn()
    render(
      <PriceInputController
        formInput={buildFormInput({ value: null })}
        onChange={onChange}
      />
    )

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "," } })

    const lastCall = onChange.mock.calls.at(-1)?.[0]
    expect(Number.isNaN(lastCall?.value)).toBe(false)
    expect(lastCall?.value).toBeNull()
  })

  it("rejette les caractères non numériques", () => {
    const onChange = vi.fn()
    render(
      <PriceInputController
        formInput={buildFormInput({ value: 1000 })}
        onChange={onChange}
      />
    )

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "abc" },
    })

    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole("textbox")).toHaveValue("10")
  })

  it("se synchronise quand la valeur externe change", () => {
    const { rerender } = render(
      <PriceInputController
        formInput={buildFormInput({ value: 1000 })}
        onChange={vi.fn()}
      />
    )
    expect(screen.getByRole("textbox")).toHaveValue("10")

    rerender(
      <PriceInputController
        formInput={buildFormInput({ value: 2599 })}
        onChange={vi.fn()}
      />
    )
    expect(screen.getByRole("textbox")).toHaveValue("25,99")
  })

  it("affiche le prix formaté en mode readonly", () => {
    render(
      <PriceInputController
        formInput={buildFormInput({ value: 1250, readonly: true })}
        onChange={vi.fn()}
      />
    )
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument()
    expect(screen.getByText(/12,50/)).toBeInTheDocument()
  })
})
