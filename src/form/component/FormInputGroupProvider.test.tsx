import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import FormElement from "@/form/component/form/FormElement"
import useForm from "@/form/hook/useForm"
import { FormInputInterface } from "@/form/FormInputInterface"
import { InputControllerComponentInterface } from "@/form/InputControllerInterface"
import { AutocompleteInputController } from "@/form/component/InputController/AutocompleteInputController"
import { DatePickerInputController } from "@/form/component/InputController/DatePickerInputController"
import { DateRangeInputController } from "@/form/component/InputController/DateRangeInputController"
import { DurationInputController } from "@/form/component/InputController/DurationInputController"
import { FileInputController } from "@/form/component/InputController/FileInputController"
import { IconInputController } from "@/form/component/InputController/IconInputController"
import { MomentInputController } from "@/form/component/InputController/MomentInputController"
import { PriceInputController } from "@/form/component/InputController/PriceInputController"
import { SelectInputController } from "@/form/component/InputController/SelectInputController"
import { SelectTimeInputController } from "@/form/component/InputController/SelectTimeInputController"
import { TimeInputController } from "@/form/component/InputController/TimeInputController"

/** A form holding the one field, without submit button. */
function SingleField({ input }: { input: FormInputInterface }) {
  const formContext = useForm({
    form: {
      label: {},
      components: { formSubmitAction: () => null },
      inputs: { field: { label: "My field", ...input } },
    },
  })

  return <FormElement {...formContext} />
}

const options = [
  { label: "One", value: "one" },
  { label: "Two", value: "two" },
]

const controllers: Record<string, InputControllerComponentInterface> = {
  AutocompleteInputController,
  DatePickerInputController,
  DateRangeInputController,
  DurationInputController,
  FileInputController,
  IconInputController,
  MomentInputController,
  PriceInputController,
  SelectInputController,
  SelectTimeInputController,
  TimeInputController,
}

describe("FormInputGroupProvider", () => {
  it.each(Object.entries(controllers))(
    "ties the label to the control of %s",
    (_, controller) => {
      render(<SingleField input={{ controller, valueOptions: options }} />)

      const control = screen.getByLabelText(/My field/)
      expect(control).toHaveAttribute("id")
      expect(document.querySelector("label")).toHaveAttribute("for", control.id)
    }
  )

  it("gives the control the label as accessible name", () => {
    render(
      <SingleField
        input={{ controller: SelectInputController, valueOptions: options }}
      />
    )

    expect(screen.getByRole("combobox", { name: "My field" })).toBeInTheDocument()
  })

  it("marks a field in error and points it to the message", () => {
    render(
      <SingleField
        input={{
          controller: PriceInputController,
          violations: [{ message: "This value is not valid." }],
        }}
      />
    )

    const control = screen.getByLabelText("My field")
    expect(control).toHaveAttribute("aria-invalid", "true")
    expect(control).toHaveAccessibleDescription("This value is not valid.")
  })

  it("points the control to its description then its errors", () => {
    render(
      <SingleField
        input={{
          description: "In euros",
          violations: [{ message: "Too low" }, { message: "Not round" }],
        }}
      />
    )

    const control = screen.getByLabelText("My field")
    expect(control).toHaveAccessibleDescription("In euros Too low Not round")
  })

  it("leaves a valid field without aria-invalid nor description", () => {
    render(<SingleField input={{}} />)

    const control = screen.getByLabelText("My field")
    expect(control).not.toHaveAttribute("aria-invalid")
    expect(control).not.toHaveAttribute("aria-describedby")
  })

  it("marks a required field with aria-required and hides the asterisk", () => {
    render(
      <SingleField
        input={{ controller: DatePickerInputController, required: true }}
      />
    )

    const control = screen.getByLabelText(/My field/)
    expect(control).toHaveAttribute("aria-required", "true")
    expect(control).toHaveAccessibleName("My field")
    expect(screen.getByText("*")).toHaveAttribute("aria-hidden", "true")
  })
})
