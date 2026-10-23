import { format, formatISO, isValid, parseISO } from "date-fns"
import { InputControllerInterface } from "@/form/InputControllerInterface"
import { DefaultInputController } from "@/form/component/InputController/DefaultInputController"
import { FormInputInterface } from "@/form/FormInputInterface"
import { formatDate } from "@/internal/date/formatDate"

// A date has no time: it is read and written as a local day, never through UTC.
// `parseISO` reads "YYYY-MM-DD" as local midnight and keeps the offset of a full
// ISO value; the value emitted is the ISO string of local midnight
// ("2026-10-23T00:00:00+02:00"), the same format as DatePickerInputController.
const parseDate = (value: unknown): Date | undefined => {
  if (!value) {
    return undefined
  }

  const date = value instanceof Date ? value : parseISO(String(value))

  return isValid(date) ? date : undefined
}

export const DateInputController = ({
  formInput,
  onChange,
}: InputControllerInterface) => {
  const change = (currentFormInput: FormInputInterface) => {
    const date = parseDate(currentFormInput.value)
    onChange({
      ...formInput,
      ...{ value: date ? formatISO(date) : null },
    })
  }

  const date = parseDate(formInput.value)

  if (formInput.readonly) {
    return formatDate(date)
  }

  const newFormInput = {
    ...formInput,
    ...{
      type: "date",
      value: date ? format(date, "yyyy-MM-dd") : undefined,
    },
  }

  return <DefaultInputController formInput={newFormInput} onChange={change} />
}
