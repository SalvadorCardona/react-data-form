import { afterEach, describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { fr } from "date-fns/locale"
import useForm from "@/form/hook/useForm"
import FormProvider from "@/form/provider/FormProvider"
import {
  createDateRangeFormInput,
  DateRangeInputController,
} from "@/form/component/InputController/DateRangeInputController"
import { configurePorts } from "@/ports"
import { setTranslation } from "react-mini-i18n"

interface EventData {
  startDate: string | null
  endDate: string | null
}

function Harness({ withTime }: { withTime: boolean }) {
  const periode = createDateRangeFormInput({ withTime })
  const formContext = useForm<EventData>({
    form: { inputs: { startDate: {}, endDate: {}, periode } },
    data: {
      startDate: new Date(2026, 10, 2, 7, 46, 0).toISOString(),
      endDate: new Date(2026, 10, 2, 10, 46, 0).toISOString(),
    },
  })

  return (
    <FormProvider formContext={formContext}>
      <DateRangeInputController
        formInput={{ ...periode, name: "periode" }}
        onChange={formContext.onChange}
      />
    </FormProvider>
  )
}

const summary = () => screen.getByText(/→/).textContent

describe("DateRangeInputController — selected range summary", () => {
  afterEach(() => {
    configurePorts({ dateLocale: undefined })
    setTranslation({})
  })

  it("joins date and time with the words of the date locale", () => {
    configurePorts({ dateLocale: fr })
    render(<Harness withTime />)

    expect(summary()).toContain("2 novembre 2026 à 07:46 → 2 novembre 2026 à 10:46")
    expect(summary()).not.toContain(" at ")
  })

  it("keeps the date alone when the range has no time", () => {
    configurePorts({ dateLocale: fr })
    render(<Harness withTime={false} />)

    expect(summary()).toContain("2 novembre 2026 → 2 novembre 2026")
  })

  it("lets the translations punctuate the label", () => {
    setTranslation({
      "Selected range": "Période sélectionnée",
      "{{label}}:": "{{label}}\u00a0:",
    })
    render(<Harness withTime />)

    expect(summary()).toMatch(/^Période sélectionnée\u00a0: /)
  })

  it("keeps a plain colon without translations", () => {
    render(<Harness withTime />)

    expect(summary()).toMatch(/^Selected range: /)
  })
})
