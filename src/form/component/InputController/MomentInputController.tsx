import { InputControllerProps } from "@/form/InputControllerInterface"
import * as React from "react"
import { FormInputInterface } from "@/form/FormInputInterface"
import { Input } from "@/ui/input"
import { DatePickerInputController } from "@/form/component/InputController/DatePickerInputController"
import { formatDateWithOur } from "@/internal/date/formatDate"
import { Badge } from "@/ui/badge"

// Suppression des imports date-fns
// import { format, formatISO, parseISO, set } from "date-fns"
// import { fr } from "date-fns/locale"

// Remplacement de parseISO (date-fns) par le constructeur natif
function parseISO(dateString: string) {
  const date = new Date(dateString)
  return isNaN(date.getTime()) ? null : date
}

// Remplacement de formatISO (date-fns)
function formatISO(date: Date) {
  return date.toISOString()
}

// Remplacement de set (date-fns)
function setDate(
  base: Date,
  values: Partial<{
    year: number
    month: number
    date: number
    hours: number
    minutes: number
  }>
) {
  const d = new Date(base)
  if (values.year !== undefined) d.setFullYear(values.year)
  if (values.month !== undefined) d.setMonth(values.month)
  if (values.date !== undefined) d.setDate(values.date)
  if (values.hours !== undefined) d.setHours(values.hours)
  if (values.minutes !== undefined) d.setMinutes(values.minutes)
  return d
}

// Remplacement de format(date, "HH:mm", { locale: fr })
function formatTimeInputValue(dateStr?: string | null) {
  if (!dateStr) return ""
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ""
  const pad = (v: number) => v.toString().padStart(2, "0")
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export const MomentInputController = ({
  formInput,
  onChange,
}: InputControllerProps<string | null | undefined>) => {
  // Time shown in the input. It is driven by local state rather than
  // directement par la valeur du formulaire : pendant la frappe, l'input time
  // goes through empty or partial intermediate states ("" when selecting the
  // field then typing, or when clearing a segment). The
  // recoller de force sur la valeur du formulaire — qui, elle, ne bouge pas
  // while the time is incomplete — used to cancel the input: the hours segment
  // reverted to its previous value and stayed stuck.
  const externalTime = formatTimeInputValue(formInput.value)
  const [timeText, setTimeText] = React.useState(externalTime)

  // Resynchronisation quand la valeur vient du formulaire et non de la frappe
  // (e.g. an end date recomputed after the start changed): the displayed time
  // then follows the new value.
  React.useEffect(() => {
    setTimeText(externalTime)
  }, [externalTime])

  const change = (currentFormInput: FormInputInterface) => {
    const value = currentFormInput.value
    const date = parseISO(value)
    if (!date) {
      onChange({ ...formInput, value })
      return
    }
    const base = formInput?.value ? new Date(formInput.value) : new Date()
    const updatedDate = setDate(base, {
      date: date.getDate(),
      month: date.getMonth(),
      year: date.getFullYear(),
    })

    onChange({
      ...formInput,
      value: value ? formatISO(updatedDate) : value,
    })
  }

  if (formInput.readonly) {
    return <Badge variant={"secondary"}>{formatDateWithOur(formInput.value)}</Badge>
  }

  const setHour = (newHour: string) => {
    // What is being typed is always reflected on screen, even when incomplete,
    // pour ne pas bloquer le clavier.
    setTimeText(newHour)

    // …but only a complete time is propagated to the form.
    if (!newHour) return
    const [hours, minutes] = newHour.split(":").map(Number)
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return
    const base = formInput?.value ? new Date(formInput.value) : new Date()
    const updatedDate = setDate(base, {
      hours,
      minutes,
    })
    onChange({
      ...formInput,
      value: formatISO(updatedDate),
    })
  }

  return (
    <div className={"flex gap-2"}>
      <DatePickerInputController formInput={formInput} onChange={change} />
      <Input
        type="time"
        value={timeText}
        className={"w-auto"}
        onChange={(e) => setHour(e.target.value)}
        // Left the field on an incomplete time: fall back to the time actually
        // stored rather than leaving a partial display.
        onBlur={() => setTimeText(externalTime)}
        readOnly={formInput.readonly}
      />
    </div>
  )
}
