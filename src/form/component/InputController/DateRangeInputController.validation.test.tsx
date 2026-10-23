import { describe, expect, it, vi } from "vitest"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import FormElement from "@/form/component/form/FormElement"
import useForm from "@/form/hook/useForm"
import { createDateRangeFormInput } from "@/form/component/InputController/DateRangeInputController"
import { createForm } from "@/form/utils/createForm"
import { validateForm } from "@/form/utils/validateForm"

const message = "The end date must be after the start date"

function RangeForm({
  onSubmit,
  startDate,
  endDate,
}: {
  onSubmit: (data: any) => void
  startDate: string
  endDate: string
}) {
  const formContext = useForm({
    form: {
      label: { submit: "Send" },
      inputs: {
        startDate: { type: "hidden" },
        endDate: { type: "hidden" },
        periode: createDateRangeFormInput({ label: "Période" }),
      },
    },
    data: { startDate, endDate },
    onSubmit,
  })
  return <FormElement {...formContext} />
}

describe("DateRangeInputController — end before start", () => {
  it("blocks the submission and shows the message under the field", async () => {
    const onSubmit = vi.fn()
    render(
      <RangeForm
        onSubmit={onSubmit}
        startDate={new Date(2026, 10, 2, 10, 0).toISOString()}
        endDate={new Date(2026, 10, 1, 10, 0).toISOString()}
      />
    )

    fireEvent.click(screen.getByRole("button", { name: "Send" }))

    await waitFor(() =>
      expect(
        screen.getByText(message, { selector: "[data-slot=field-error]" })
      ).toBeTruthy()
    )
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("submits a valid range", async () => {
    const onSubmit = vi.fn()
    render(
      <RangeForm
        onSubmit={onSubmit}
        startDate={new Date(2026, 10, 1, 10, 0).toISOString()}
        endDate={new Date(2026, 10, 2, 10, 0).toISOString()}
      />
    )

    fireEvent.click(screen.getByRole("button", { name: "Send" }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalled())
  })

  it("reads startKey and endKey in the data", () => {
    const form = createForm(
      {
        inputs: {
          from: {},
          to: {},
          periode: createDateRangeFormInput({ startKey: "from", endKey: "to" }),
        },
      },
      {
        from: "2026-11-02T10:00:00.000Z",
        to: "2026-11-02T10:00:00.000Z",
      }
    )

    const result = validateForm(form)

    expect(result.inputs.periode.violations).toEqual([
      expect.objectContaining({ propertyPath: "to", message }),
    ])
  })
})
