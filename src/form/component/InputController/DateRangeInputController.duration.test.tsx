import { describe, expect, it } from "vitest"
import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import useForm from "@/form/hook/useForm"
import FormProvider from "@/form/provider/FormProvider"
import {
  createDateRangeFormInput,
  DateRangeInputController,
} from "@/form/component/InputController/DateRangeInputController"

interface EventData {
  startDate: string | null
  endDate: string | null
  duration: number | null
}

/**
 * Reproduces an update view holding a hidden duration alongside an editable
 * range wired to it.
 */
function Harness({ data }: { data: EventData }) {
  const periode = createDateRangeFormInput({ durationKey: "duration" })
  const formContext = useForm<EventData>({
    form: {
      inputs: {
        duration: { type: "hidden" },
        startDate: {},
        endDate: {},
        periode,
      },
    },
    data,
  })

  return (
    <FormProvider formContext={formContext}>
      <DateRangeInputController
        formInput={{ ...periode, name: "periode" }}
        onChange={formContext.onChange}
      />
      <output data-testid="data">{JSON.stringify(formContext.form.data)}</output>
    </FormProvider>
  )
}

const currentData = (): EventData =>
  JSON.parse(screen.getByTestId("data").textContent ?? "{}") as EventData

/** Changes the time of picker `index` (0 = start, 2 = end). */
async function selectHour(index: number, hour: string) {
  const user = userEvent.setup()
  await user.click(screen.getAllByRole("combobox")[index])
  await user.click(await screen.findByRole("option", { name: `${hour}h` }))
  await act(async () => {})
}

describe("DateRangeInputController — duration synchronisation", () => {
  it("derives the end date from the duration when none is set", async () => {
    render(
      <Harness
        data={{
          startDate: new Date(2026, 5, 15, 9, 0, 0).toISOString(),
          endDate: null,
          duration: 5400, // 1h30, the inherited duration
        }}
      />
    )

    await selectHour(0, "10")

    const data = currentData()
    expect(new Date(data.startDate!).getHours()).toBe(10)
    expect(new Date(data.endDate!).getHours()).toBe(11)
    expect(new Date(data.endDate!).getMinutes()).toBe(30)
    expect(data.duration).toBe(5400)
  })

  it("recomputes the duration when the end date is edited by hand", async () => {
    render(
      <Harness
        data={{
          startDate: new Date(2026, 5, 15, 9, 0, 0).toISOString(),
          endDate: new Date(2026, 5, 15, 10, 0, 0).toISOString(),
          duration: 3600, // 1h, inherited
        }}
      />
    )

    await selectHour(2, "12")

    const data = currentData()
    expect(new Date(data.endDate!).getHours()).toBe(12)
    expect(data.duration).toBe(3 * 3600)
  })

  it("preserves the duration by shifting the end date when the start changes", async () => {
    render(
      <Harness
        data={{
          startDate: new Date(2026, 5, 15, 9, 0, 0).toISOString(),
          endDate: new Date(2026, 5, 15, 10, 0, 0).toISOString(),
          duration: 3600,
        }}
      />
    )

    await selectHour(0, "14")

    const data = currentData()
    expect(new Date(data.startDate!).getHours()).toBe(14)
    expect(new Date(data.endDate!).getHours()).toBe(15)
    expect(data.duration).toBe(3600)
  })
})
