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
 * Reproduit la configuration de la vue « update » d'un rendez-vous : une durée
 * cachée (héritée du service) et une période éditable branchée dessus.
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

/** Change l'heure du sélecteur `index` (0 = début, 2 = fin). */
async function selectHour(index: number, hour: string) {
  const user = userEvent.setup()
  await user.click(screen.getAllByRole("combobox")[index])
  await user.click(await screen.findByRole("option", { name: `${hour}h` }))
  await act(async () => {})
}

describe("DateRangeInputController — synchronisation de la durée", () => {
  it("déduit la date de fin de la durée quand aucune n'est renseignée", async () => {
    render(
      <Harness
        data={{
          startDate: new Date(2026, 5, 15, 9, 0, 0).toISOString(),
          endDate: null,
          duration: 5400, // 1h30, durée du service
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

  it("recalcule la durée quand la date de fin est modifiée à la main", async () => {
    render(
      <Harness
        data={{
          startDate: new Date(2026, 5, 15, 9, 0, 0).toISOString(),
          endDate: new Date(2026, 5, 15, 10, 0, 0).toISOString(),
          duration: 3600, // 1h héritée du service
        }}
      />
    )

    await selectHour(2, "12")

    const data = currentData()
    expect(new Date(data.endDate!).getHours()).toBe(12)
    expect(data.duration).toBe(3 * 3600)
  })

  it("préserve la durée en décalant la date de fin quand le début change", async () => {
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
