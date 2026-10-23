import { describe, expect, it } from "vitest"
import { render, screen, act } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { SelectInputController } from "@/form/component/InputController/SelectInputController"
import { FormInputInterface } from "@/form/FormInputInterface"
import { configurePorts, getPorts } from "@/ports"

const tvaOptions = [
  { label: "20 %", value: 20.0 },
  { label: "15 %", value: 15.0 },
  { label: "10 %", value: 10.0 },
  { label: "5 %", value: 5.0 },
  { label: "0 %", value: 0 },
]

const buildFormInput = (
  overrides: Partial<FormInputInterface> = {}
): FormInputInterface =>
  ({
    name: "vat",
    label: "TVA",
    placeholder: "20 %",
    valueOptions: tvaOptions,
    ...overrides,
  }) as FormInputInterface

function Harness({
  initial,
  overrides = {},
}: {
  initial: unknown
  overrides?: Partial<FormInputInterface>
}) {
  const [value, setValue] = useState<unknown>(initial)

  return (
    <div>
      <SelectInputController
        formInput={buildFormInput({ ...overrides, value })}
        onChange={(input) => setValue(input.value)}
      />
      <output data-testid="current-value">{JSON.stringify(value)}</output>
    </div>
  )
}

const triggerText = () =>
  screen.getByRole("combobox").textContent?.replace("▼", "").trim()

describe("SelectInputController", () => {
  it("going from 20% to 0% updates both the value and the display", async () => {
    const user = userEvent.setup()
    render(<Harness initial={20} />)

    expect(triggerText()).toBe("20 %")

    await user.click(screen.getByRole("combobox"))
    await user.click(await screen.findByRole("option", { name: "0 %" }))
    await act(async () => {})

    expect(screen.getByTestId("current-value").textContent).toBe("0")
    expect(triggerText()).toBe("0 %")
  })

  it("re-selecting the already chosen option does not clear the value", async () => {
    const user = userEvent.setup()
    render(<Harness initial={0} />)

    expect(triggerText()).toBe("0 %")

    await user.click(screen.getByRole("combobox"))
    await user.click(await screen.findByRole("option", { name: "0 %" }))
    await act(async () => {})

    expect(screen.getByTestId("current-value").textContent).toBe("0")
    expect(triggerText()).toBe("0 %")
  })

  it('renders "0 %" even when the value drifted to the string "0"', () => {
    render(
      <SelectInputController
        formInput={buildFormInput({ value: "0" })}
        onChange={() => {}}
      />
    )

    expect(triggerText()).toBe("0 %")
  })

  it("renders the placeholder when no value is set", () => {
    render(
      <SelectInputController
        formInput={buildFormInput({ value: undefined })}
        onChange={() => {}}
      />
    )

    expect(triggerText()).toBe("20 %")
  })

  // Les filtres de liste (agenda) utilisent une option vide « Tout » pour
  // reset the filter: it must stay selectable both ways, otherwise a filter
  // could never be removed once applied.
  it("treats an empty-valued option as a reset choice", async () => {
    const user = userEvent.setup()
    const filterOptions = [
      { label: "Tous les statuts", value: "" },
      { label: "Accepted", value: "ACCEPTED" },
    ]

    render(<Harness initial={""} overrides={{ valueOptions: filterOptions }} />)

    expect(triggerText()).toBe("Tous les statuts")

    await user.click(screen.getByRole("combobox"))
    await user.click(await screen.findByRole("option", { name: "Accepted" }))
    await act(async () => {})

    expect(screen.getByTestId("current-value").textContent).toBe('"ACCEPTED"')

    await user.click(screen.getByRole("combobox"))
    await user.click(await screen.findByRole("option", { name: "Tous les statuts" }))
    await act(async () => {})

    expect(screen.getByTestId("current-value").textContent).toBe('""')
    expect(triggerText()).toBe("Tous les statuts")
  })
})

describe("SelectInputController — clearing and missing values", () => {
  it("offers an empty option that clears a non-required field to null", async () => {
    const user = userEvent.setup()
    render(<Harness initial={20} />)

    await user.click(screen.getByRole("combobox"))
    await user.click(await screen.findByRole("option", { name: "None" }))
    await act(async () => {})

    expect(screen.getByTestId("current-value").textContent).toBe("null")
    expect(triggerText()).toBe("20 %")
  })

  it("offers no empty option on a required field", async () => {
    const user = userEvent.setup()
    render(<Harness initial={20} overrides={{ required: true }} />)

    await user.click(screen.getByRole("combobox"))
    await screen.findByRole("option", { name: "20 %" })

    expect(screen.queryByRole("option", { name: "None" })).toBeNull()
  })

  it("shows a value missing from the options as the current value", async () => {
    const user = userEvent.setup()
    render(<Harness initial={19.6} />)

    expect(triggerText()).toBe("19.6(Current value)")

    await user.click(screen.getByRole("combobox"))
    expect(
      await screen.findByRole("option", { name: "19.6(Current value)" })
    ).toBeTruthy()

    await user.click(screen.getByRole("option", { name: "10 %" }))
    await act(async () => {})

    expect(screen.getByTestId("current-value").textContent).toBe("10")
    expect(triggerText()).toBe("10 %")

    // The stored value stays listed, so the user can go back to it.
    await user.click(screen.getByRole("combobox"))
    await user.click(
      await screen.findByRole("option", { name: "19.6(Current value)" })
    )
    await act(async () => {})

    expect(screen.getByTestId("current-value").textContent).toBe("19.6")
  })

  it("clears a value missing from the options with the empty option", async () => {
    const user = userEvent.setup()
    render(<Harness initial={19.6} />)

    await user.click(screen.getByRole("combobox"))
    await user.click(await screen.findByRole("option", { name: "None" }))
    await act(async () => {})

    expect(screen.getByTestId("current-value").textContent).toBe("null")
    expect(triggerText()).toBe("20 %")
  })

  it("renders a missing IRI through the iriLabel port", () => {
    const { iriLabel } = getPorts().components
    configurePorts({
      components: { iriLabel: ({ iri }) => <span>Label of {iri}</span> },
    })

    try {
      render(
        <SelectInputController
          formInput={buildFormInput({ value: "/api/vat_rates/7" })}
          onChange={() => {}}
        />
      )

      expect(triggerText()).toBe("Label of /api/vat_rates/7(Current value)")
    } finally {
      configurePorts({ components: { iriLabel } })
    }
  })
})
