import { InputControllerInterface } from "@/form/InputControllerInterface"
import { Input } from "@/ui/input"
import { formatDateToDateWithHours } from "@/internal/date/formatDate"

export const TimeInputController = ({
  formInput,
  onChange,
}: InputControllerInterface) => {
  const setHour = (newHour: string | undefined) => {
    if (!newHour) {
      onChange({
        ...formInput,
        ...{ value: newHour },
      })

      return
    }

    const [hours, minutes] = newHour.split(":").map(Number)

    const updatedDate = new Date(formInput?.value ?? new Date())
    updatedDate.setHours(hours, minutes, 0, 0)

    onChange({
      ...formInput,
      ...{ value: updatedDate.toISOString() },
    })
  }

  const value = formInput.value ? new Date(formInput.value) : undefined
  const content = formatDateToDateWithHours(value)

  if (formInput.readonly) {
    return formInput.value ? content : "-"
  }

  return (
    <>
      <Input
        className={"w-auto"}
        type="time"
        defaultValue={content}
        onChange={(e) => setHour(e.target.value)}
      />
    </>
  )
}
