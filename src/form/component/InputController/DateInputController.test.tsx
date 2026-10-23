import { afterAll, beforeAll, describe, expect, it, vi } from "vitest"
import { fireEvent, render } from "@testing-library/react"
import { DateInputController } from "@/form/component/InputController/DateInputController"
import { FormInputInterface } from "@/form/FormInputInterface"
import { configurePorts } from "@/ports"

configurePorts({ intlLocale: "fr-FR" })

const buildFormInput = (
  overrides: Partial<FormInputInterface<string | null | undefined>> = {}
): FormInputInterface<string | null | undefined> => ({
  name: "birthDate",
  ...overrides,
})

const getDateInput = (container: HTMLElement): HTMLInputElement => {
  const input = container.querySelector<HTMLInputElement>('input[type="date"]')
  if (!input) throw new Error("date input not found")
  return input
}

// A day east of UTC and a day west of it: converting through UTC shifts the
// date backwards in the first one and forwards in the second.
describe.each([
  { timeZone: "Europe/Paris", localMidnight: "2026-10-23T00:00:00+02:00" },
  { timeZone: "America/New_York", localMidnight: "2026-10-23T00:00:00-04:00" },
])("DateInputController in $timeZone", ({ timeZone, localMidnight }) => {
  const previousTimeZone = process.env.TZ

  beforeAll(() => {
    process.env.TZ = timeZone
  })

  afterAll(() => {
    process.env.TZ = previousTimeZone
  })

  it("displays the local day of a value at local midnight", () => {
    const { container } = render(
      <DateInputController
        formInput={buildFormInput({ value: localMidnight })}
        onChange={vi.fn()}
      />
    )

    expect(getDateInput(container).value).toBe("2026-10-23")
  })

  it("displays a YYYY-MM-DD value as is", () => {
    const { container } = render(
      <DateInputController
        formInput={buildFormInput({ value: "2026-10-23" })}
        onChange={vi.fn()}
      />
    )

    expect(getDateInput(container).value).toBe("2026-10-23")
  })

  it("emits the picked day at local midnight, like DatePickerInputController", () => {
    const onChange = vi.fn()
    const { container } = render(
      <DateInputController formInput={buildFormInput()} onChange={onChange} />
    )

    fireEvent.change(getDateInput(container), { target: { value: "2026-10-23" } })

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ value: localMidnight })
    )
  })

  it("shows only the date when readonly", () => {
    const { container } = render(
      <DateInputController
        formInput={buildFormInput({ value: localMidnight, readonly: true })}
        onChange={vi.fn()}
      />
    )

    expect(container.textContent).toBe("23/10/2026")
  })
})

describe("DateInputController", () => {
  it("does not mutate the formInput prop", () => {
    const formInput = Object.freeze(buildFormInput({ value: "2026-10-23" }))

    expect(() =>
      render(<DateInputController formInput={formInput} onChange={vi.fn()} />)
    ).not.toThrow()
    expect(formInput.type).toBeUndefined()
  })
})
