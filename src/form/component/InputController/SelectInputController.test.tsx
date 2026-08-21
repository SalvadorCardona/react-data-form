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
  it("passe de 20 % à 0 % : la valeur et l'affichage suivent", async () => {
    const user = userEvent.setup()
    render(<Harness initial={20} />)

    expect(triggerText()).toBe("20 %")

    await user.click(screen.getByRole("combobox"))
    await user.click(await screen.findByRole("option", { name: "0 %" }))
    await act(async () => {})

    expect(screen.getByTestId("current-value").textContent).toBe("0")
    expect(triggerText()).toBe("0 %")
  })

  it("re-sélectionner l'option déjà choisie ne vide pas la valeur", async () => {
    const user = userEvent.setup()
    render(<Harness initial={0} />)

    expect(triggerText()).toBe("0 %")

    await user.click(screen.getByRole("combobox"))
    await user.click(await screen.findByRole("option", { name: "0 %" }))
    await act(async () => {})

    expect(screen.getByTestId("current-value").textContent).toBe("0")
    expect(triggerText()).toBe("0 %")
  })

  it('affiche "0 %" même si la valeur a dérivé en string "0"', () => {
    render(
      <SelectInputController
        formInput={buildFormInput({ value: "0" })}
        onChange={() => {}}
      />
    )

    expect(triggerText()).toBe("0 %")
  })

  it("affiche le placeholder quand aucune valeur n'est définie", () => {
    render(
      <SelectInputController
        formInput={buildFormInput({ value: undefined })}
        onChange={() => {}}
      />
    )

    expect(triggerText()).toBe("20 %")
  })

  // Les filtres de liste (agenda) utilisent une option vide « Tout » pour
  // remettre le filtre à zéro : elle doit rester sélectionnable dans les deux
  // sens, sinon on ne peut plus enlever un filtre une fois posé.
  it("gère une option de valeur vide comme choix de remise à zéro", async () => {
    const user = userEvent.setup()
    const filterOptions = [
      { label: "Tous les statuts", value: "" },
      { label: "Accepté", value: "ACCEPTED" },
    ]

    render(<Harness initial={""} overrides={{ valueOptions: filterOptions }} />)

    expect(triggerText()).toBe("Tous les statuts")

    await user.click(screen.getByRole("combobox"))
    await user.click(await screen.findByRole("option", { name: "Accepté" }))
    await act(async () => {})

    expect(screen.getByTestId("current-value").textContent).toBe('"ACCEPTED"')

    await user.click(screen.getByRole("combobox"))
    await user.click(await screen.findByRole("option", { name: "Tous les statuts" }))
    await act(async () => {})

    expect(screen.getByTestId("current-value").textContent).toBe('""')
    expect(triggerText()).toBe("Tous les statuts")
  })
})
