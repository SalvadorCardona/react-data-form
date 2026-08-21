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
  // Heure affichée dans l'input. Elle est pilotée par un état local plutôt que
  // directement par la valeur du formulaire : pendant la frappe, l'input time
  // passe par des états intermédiaires vides ou incomplets ("" quand on
  // sélectionne le champ puis qu'on tape, ou quand on efface un segment). Les
  // recoller de force sur la valeur du formulaire — qui, elle, ne bouge pas
  // tant que l'heure n'est pas complète — annulait la saisie : le segment des
  // heures revenait à son ancienne valeur et restait bloqué.
  const externalTime = formatTimeInputValue(formInput.value)
  const [timeText, setTimeText] = React.useState(externalTime)

  // Resynchronisation quand la valeur vient du formulaire et non de la frappe
  // (ex. la date de fin recalculée après un changement du début) : l'heure
  // affichée suit alors la nouvelle valeur.
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
    // La saisie en cours est toujours reflétée à l'écran, même incomplète,
    // pour ne pas bloquer le clavier.
    setTimeText(newHour)

    // ...mais seule une heure complète est propagée au formulaire.
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
        // Champ quitté sur une heure incomplète : on revient à l'heure
        // réellement enregistrée plutôt que de laisser un affichage partiel.
        onBlur={() => setTimeText(externalTime)}
        readOnly={formInput.readonly}
      />
    </div>
  )
}
