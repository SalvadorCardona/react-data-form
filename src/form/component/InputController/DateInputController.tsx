import { InputControllerInterface } from "@/form/InputControllerInterface"
import { DefaultInputController } from "@/form/component/InputController/DefaultInputController"
import { FormInputInterface } from "@/form/FormInputInterface"
import { formatDateWithOur } from "@/internal/date/formatDate"

export const DateInputController = ({
  formInput,
  onChange,
}: InputControllerInterface) => {
  formInput.type = "date"

  const change = (currentFormInput: FormInputInterface) => {
    const value = currentFormInput.value
    onChange({
      ...formInput,
      ...{ value: value ? new Date(value).toISOString() : null },
    })
  }

  if (formInput.readonly) {
    return formatDateWithOur(formInput.value)
  }

  let currentDate = undefined
  if (formInput.value) {
    try {
      const parsedDate = new Date(formInput.value)
      currentDate = parsedDate.toISOString().slice(0, 10)
    } catch {
      // Date invalide : on laisse `currentDate` à undefined.
    }
  }

  const newFormInput = {
    ...formInput,
    ...{
      value: currentDate,
    },
  }

  return <DefaultInputController formInput={newFormInput} onChange={change} />
}
