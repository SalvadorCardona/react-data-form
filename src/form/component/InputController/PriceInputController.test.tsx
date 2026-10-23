import { afterEach, describe, expect, it, vi } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import { PriceInputController } from "@/form/component/InputController/PriceInputController"
import { FormInputInterface } from "@/form/FormInputInterface"
import { configurePorts } from "@/ports"

// The readonly rendering below expects French formatting.
configurePorts({ intlLocale: "fr-FR", currency: "EUR" })

const buildFormInput = (
  overrides: Partial<FormInputInterface<number | undefined | null>> = {}
): FormInputInterface<number | undefined | null> => ({
  name: "price",
  ...overrides,
})

describe("PriceInputController", () => {
  it("renders an empty string when the value is null, undefined or NaN", () => {
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

  it("renders cents as euros with a decimal comma", () => {
    render(
      <PriceInputController
        formInput={buildFormInput({ value: 1250 })}
        onChange={vi.fn()}
      />
    )
    expect(screen.getByRole("textbox")).toHaveValue("12,5")
  })

  it("converts an input using a comma into cents", () => {
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

  it("converts an input using a dot into cents", () => {
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

  it("allows typing a decimal value progressively (12,)", () => {
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

  it("returns null for an empty input", () => {
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

  it("never produces NaN, even for an input holding only a comma", () => {
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

  it("rejects non-numeric characters", () => {
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

  it("syncs when the external value changes", () => {
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

  it("renders the formatted price in readonly mode", () => {
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

describe("PriceInputController with the currency port", () => {
  afterEach(() => {
    configurePorts({ intlLocale: "fr-FR", currency: "EUR" })
  })

  it("renders EUR/fr-FR with a trailing symbol and a decimal comma", () => {
    configurePorts({ intlLocale: "fr-FR", currency: "EUR" })
    render(
      <PriceInputController
        formInput={buildFormInput({ value: 1250 })}
        onChange={vi.fn()}
      />
    )
    const input = screen.getByRole("textbox")
    expect(input).toHaveValue("12,5")
    expect(input).toHaveAttribute("placeholder", "0,00")
    const symbol = screen.getByText("€")
    expect(
      input.compareDocumentPosition(symbol) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
  })

  it("renders USD/en-US with a leading symbol and a decimal dot", () => {
    configurePorts({ intlLocale: "en-US", currency: "USD" })
    render(
      <PriceInputController
        formInput={buildFormInput({ value: 1250 })}
        onChange={vi.fn()}
      />
    )
    const input = screen.getByRole("textbox")
    expect(input).toHaveValue("12.5")
    expect(input).toHaveAttribute("placeholder", "0.00")
    expect(screen.queryByText("€")).not.toBeInTheDocument()
    const symbol = screen.getByText("$")
    expect(
      input.compareDocumentPosition(symbol) & Node.DOCUMENT_POSITION_PRECEDING
    ).toBeTruthy()
  })

  it("accepts both a comma and a dot as decimal separator in USD/en-US", () => {
    configurePorts({ intlLocale: "en-US", currency: "USD" })
    const onChange = vi.fn()
    render(
      <PriceInputController
        formInput={buildFormInput({ value: null })}
        onChange={onChange}
      />
    )
    const input = screen.getByRole("textbox")

    fireEvent.change(input, { target: { value: "12,50" } })
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ value: 1250 })
    )

    fireEvent.change(input, { target: { value: "7.25" } })
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ value: 725 })
    )
  })

  it("renders JPY without decimals and rejects a decimal separator", () => {
    configurePorts({ intlLocale: "en-US", currency: "JPY" })
    const onChange = vi.fn()
    render(
      <PriceInputController
        formInput={buildFormInput({ value: 150000 })}
        onChange={onChange}
      />
    )
    const input = screen.getByRole("textbox")
    expect(input).toHaveValue("1500")
    expect(input).toHaveAttribute("placeholder", "0")
    expect(screen.getByText("¥")).toBeInTheDocument()

    fireEvent.change(input, { target: { value: "1500.5" } })
    expect(onChange).not.toHaveBeenCalled()

    fireEvent.change(input, { target: { value: "2000" } })
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ value: 200000 })
    )
  })

  it("renders the readonly price with the configured currency", () => {
    configurePorts({ intlLocale: "en-US", currency: "USD" })
    render(
      <PriceInputController
        formInput={buildFormInput({ value: 1250, readonly: true })}
        onChange={vi.fn()}
      />
    )
    expect(screen.getByText("$12.50")).toBeInTheDocument()
  })

  it("renders a dash for a null readonly value", () => {
    render(
      <PriceInputController
        formInput={buildFormInput({ value: null, readonly: true })}
        onChange={vi.fn()}
      />
    )
    expect(screen.getByText("-")).toBeInTheDocument()
    expect(screen.queryByText(/0,00/)).not.toBeInTheDocument()
  })
})
