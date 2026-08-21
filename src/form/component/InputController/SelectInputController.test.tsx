import { describe, expect, it } from "vitest"
import { render, screen, act } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { SelectInputController } from "@/form/component/InputController/SelectInputController"
import { FormInputInterface } from "@/form/FormInputInterface"

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
