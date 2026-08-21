import * as React from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { CalendarIcon, Clock } from "lucide-react"

import { InputControllerInterface } from "@/form/InputControllerInterface"
import { FormInputInterface } from "@/form/FormInputInterface"
import useFormContext from "@/form/provider/useFormContext"
import { cn } from "@/ui/cn"
import { Button } from "@/ui/button"
import { Calendar } from "@/ui/calendar"
import { Label } from "@/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select"
import translate from "@/i18n/translate"
import getFormInputInForm from "@/form/utils/getFormInputInForm"

export interface DateRangeFormInputInterface extends FormInputInterface {
  startKey?: string
  endKey?: string
  /** Affiche les sélecteurs d'heure (défaut : true). Mettre à false pour une période à la journée. */
  withTime?: boolean
  /**
   * Clé d'une durée (en secondes) présente dans les données du formulaire.
   * Lorsqu'elle est définie et que la date de fin n'est pas encore renseignée,
   * la date de fin est calculée à partir de la date de début et de cette durée
   * (ex. durée d'un service utilisé comme modèle). Réciproquement, toute
   * modification de la période met la durée à jour pour rester cohérente.
   */
  durationKey?: string
}

export function createDateRangeFormInput(props: DateRangeFormInputInterface = {}) {
  return {
    controller: DateRangeInputController,
    startKey: "startDate",
    endKey: "endDate",
    withTime: true,
    ...props,
  } as DateRangeFormInputInterface
}

interface DateTimeSelection {
  date: Date | undefined
  hour: string
  minute: string
}

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"))
const MINUTES = Array.from({ length: 12 }, (_, i) =>
  (i * 5).toString().padStart(2, "0")
)

function toSelection(
  value: string | null | undefined,
  fallback: string | { hour: string; minute: string }
): DateTimeSelection {
  if (!value) {
    const { hour, minute } =
      typeof fallback === "string" ? { hour: fallback, minute: "00" } : fallback
    return { date: undefined, hour, minute }
  }
  const d = new Date(value)
  return {
    date: d,
    hour: d.getHours().toString().padStart(2, "0"),
    minute: d.getMinutes().toString().padStart(2, "0"),
  }
}

function combineDateTime(selection: DateTimeSelection): Date | undefined {
  if (!selection.date) return undefined
  const combined = new Date(selection.date)
  combined.setHours(parseInt(selection.hour), parseInt(selection.minute), 0, 0)
  return combined
}

/**
 * Construit la sélection de date de fin en ajoutant une durée (en secondes) à
 * la date de début. Utilisé pour déduire la date de fin d'un service.
 */
export function selectionFromDuration(
  start: Date,
  durationInSecond: number
): DateTimeSelection {
  const end = new Date(start.getTime() + durationInSecond * 1000)
  return {
    date: end,
    hour: end.getHours().toString().padStart(2, "0"),
    minute: end.getMinutes().toString().padStart(2, "0"),
  }
}

const DEFAULT_START_HOUR = "09"
const DEFAULT_END_HOUR = "17"

/**
 * Horaire de fin proposé tant que rien n'est saisi : début + durée lorsqu'une
 * durée est connue, sinon la fin de journée par défaut. La durée est ignorée
 * si elle déborde de la journée — la date de fin, elle, se choisit au
 * calendrier.
 */
export function fallbackEndTime(
  start: { hour: string; minute: string },
  durationInSecond: number
): { hour: string; minute: string } {
  const fallback = { hour: DEFAULT_END_HOUR, minute: "00" }

  if (!Number.isFinite(durationInSecond) || durationInSecond <= 0) {
    return fallback
  }

  const startMinutes = parseInt(start.hour, 10) * 60 + parseInt(start.minute, 10)
  const endMinutes = startMinutes + Math.round(durationInSecond / 60)
  if (!Number.isFinite(endMinutes) || endMinutes >= 24 * 60) {
    return fallback
  }

  return {
    hour: Math.floor(endMinutes / 60)
      .toString()
      .padStart(2, "0"),
    minute: (endMinutes % 60).toString().padStart(2, "0"),
  }
}

function formatDisplayDate(selection: DateTimeSelection): string {
  if (!selection.date) return translate("Choisir une date")
  return format(selection.date, "d MMM yyyy", { locale: fr })
}

export const DateRangeInputController = ({
  formInput,
  onChange,
}: InputControllerInterface<DateRangeFormInputInterface>) => {
  const formContext = useFormContext()
  const [startOpen, setStartOpen] = React.useState(false)
  const [endOpen, setEndOpen] = React.useState(false)
  const startKey = formInput.startKey ?? "startDate"
  const endKey = formInput.endKey ?? "endDate"
  const withTime = formInput.withTime ?? true

  const formInputStart = getFormInputInForm(formContext.form, startKey)
  const formInputEnd = getFormInputInForm(formContext.form, endKey)
  const formInputDuration = formInput.durationKey
    ? getFormInputInForm(formContext.form, formInput.durationKey)
    : undefined

  const data = (formContext.form.data ?? {}) as Record<string, unknown>
  const startSelection = toSelection(
    data[startKey] as string | null | undefined,
    DEFAULT_START_HOUR
  )
  const endSelection = toSelection(
    data[endKey] as string | null | undefined,
    // Tant qu'aucune date n'est saisie, l'horaire de fin proposé découle de la
    // durée connue (celle du service, par exemple) : afficher 17 h pour un
    // rendez-vous d'une heure suggérait une plage sans rapport avec le service.
    fallbackEndTime(
      startSelection,
      formInput.durationKey ? Number(data[formInput.durationKey]) : Number.NaN
    )
  )

  const durationInSecond = formInput.durationKey
    ? Number(data[formInput.durationKey])
    : Number.NaN

  const updateRange = (start: DateTimeSelection, end: DateTimeSelection) => {
    const startDate = combineDateTime(start)
    const endDate = combineDateTime(end)

    if (formInputStart) {
      onChange({
        ...formInputStart,
        value: startDate ? startDate.toISOString() : null,
      })
    }
    if (formInputEnd) {
      onChange({
        ...formInputEnd,
        value: endDate ? endDate.toISOString() : null,
      })
    }

    // La durée doit refléter la période effectivement choisie : sinon une durée
    // héritée (celle du service, par exemple) contredirait la date de fin
    // saisie et l'API recalculerait cette dernière à l'enregistrement.
    if (formInputDuration && startDate && endDate) {
      onChange({
        ...formInputDuration,
        value: Math.round((endDate.getTime() - startDate.getTime()) / 1000),
      })
    }
  }

  // Quand la date de début change, on décale la date de fin du même intervalle
  // afin de préserver la durée de l'événement. Si aucune date de fin n'est encore
  // renseignée, on la déduit de la durée fournie (ex. durée du service).
  const updateStart = (start: DateTimeSelection) => {
    const previousStart = combineDateTime(startSelection)
    const nextStart = combineDateTime(start)
    const previousEnd = combineDateTime(endSelection)

    let nextEnd = endSelection
    if (previousStart && nextStart && previousEnd) {
      const delta = nextStart.getTime() - previousStart.getTime()
      const shiftedEnd = new Date(previousEnd.getTime() + delta)
      nextEnd = {
        date: shiftedEnd,
        hour: shiftedEnd.getHours().toString().padStart(2, "0"),
        minute: shiftedEnd.getMinutes().toString().padStart(2, "0"),
      }
    } else if (
      nextStart &&
      !previousEnd &&
      Number.isFinite(durationInSecond) &&
      durationInSecond > 0
    ) {
      nextEnd = selectionFromDuration(nextStart, durationInSecond)
    }

    updateRange(start, nextEnd)
  }

  const startCombined = combineDateTime(startSelection)
  const endCombined = combineDateTime(endSelection)
  const validationError =
    startCombined && endCombined && endCombined <= startCombined
      ? translate("La date de fin doit être après la date de début")
      : null

  return (
    <div className="w-full max-w-2xl">
      <div className="relative">
        <div className="relative grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                1
              </div>
              <Label className="text-sm font-medium text-foreground">
                {translate("Date de début")}
              </Label>
            </div>

            <div className="space-y-3">
              <Popover open={startOpen} onOpenChange={setStartOpen}>
                {/* `render` fusionne le déclencheur avec le bouton : imbriqués,
                    ils produiraient un <button> dans un <button>, HTML invalide
                    qui déclenche une erreur d'hydratation React. */}
                <PopoverTrigger
                  render={
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal transition-all hover:border-primary/50 hover:bg-primary/5",
                        !startSelection.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 size-4 text-primary" />
                      {formatDisplayDate(startSelection)}
                    </Button>
                  }
                />
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startSelection.date}
                    onSelect={(date) => {
                      setStartOpen(false)
                      updateStart({
                        ...startSelection,
                        // react-day-picker renvoie undefined quand on re-clique
                        // sur la date déjà sélectionnée : on la conserve.
                        date: date ?? startSelection.date,
                      })
                    }}
                  />
                </PopoverContent>
              </Popover>

              {withTime && (
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-muted-foreground" />
                  <div className="flex flex-1 items-center gap-2">
                    <Select
                      value={startSelection.hour}
                      onValueChange={(hour) =>
                        updateStart({ ...startSelection, hour: hour ?? "00" })
                      }
                    >
                      <SelectTrigger className="flex-1 transition-all hover:border-primary/50">
                        <SelectValue placeholder="HH" />
                      </SelectTrigger>
                      <SelectContent>
                        {HOURS.map((hour) => (
                          <SelectItem key={hour} value={hour}>
                            {hour}h
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="text-muted-foreground">:</span>
                    <Select
                      value={startSelection.minute}
                      onValueChange={(minute) =>
                        updateStart({ ...startSelection, minute: minute ?? "00" })
                      }
                    >
                      <SelectTrigger className="flex-1 transition-all hover:border-primary/50">
                        <SelectValue placeholder="MM" />
                      </SelectTrigger>
                      <SelectContent>
                        {MINUTES.map((minute) => (
                          <SelectItem key={minute} value={minute}>
                            {minute}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                2
              </div>
              <Label className="text-sm font-medium text-foreground">
                {translate("Date de fin")}
              </Label>
            </div>

            <div className="space-y-3">
              <Popover open={endOpen} onOpenChange={setEndOpen}>
                <PopoverTrigger
                  render={
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal transition-all hover:border-primary/50 hover:bg-primary/5",
                        !endSelection.date && "text-muted-foreground",
                        validationError && endSelection.date && "border-destructive"
                      )}
                    >
                      <CalendarIcon className="mr-2 size-4 text-primary" />
                      {formatDisplayDate(endSelection)}
                    </Button>
                  }
                />
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endSelection.date}
                    onSelect={(date) => {
                      setEndOpen(false)
                      updateRange(startSelection, {
                        ...endSelection,
                        // react-day-picker renvoie undefined quand on re-clique
                        // sur la date déjà sélectionnée : on la conserve.
                        date: date ?? endSelection.date,
                      })
                    }}
                  />
                </PopoverContent>
              </Popover>

              {withTime && (
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-muted-foreground" />
                  <div className="flex flex-1 items-center gap-2">
                    <Select
                      value={endSelection.hour}
                      onValueChange={(hour) =>
                        updateRange(startSelection, {
                          ...endSelection,
                          hour: hour ?? "00",
                        })
                      }
                    >
                      <SelectTrigger
                        className={cn(
                          "flex-1 transition-all hover:border-primary/50",
                          validationError && "border-destructive"
                        )}
                      >
                        <SelectValue placeholder="HH" />
                      </SelectTrigger>
                      <SelectContent>
                        {HOURS.map((hour) => (
                          <SelectItem key={hour} value={hour}>
                            {hour}h
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="text-muted-foreground">:</span>
                    <Select
                      value={endSelection.minute}
                      onValueChange={(minute) =>
                        updateRange(startSelection, {
                          ...endSelection,
                          minute: minute ?? "00",
                        })
                      }
                    >
                      <SelectTrigger
                        className={cn(
                          "flex-1 transition-all hover:border-primary/50",
                          validationError && "border-destructive"
                        )}
                      >
                        <SelectValue placeholder="MM" />
                      </SelectTrigger>
                      <SelectContent>
                        {MINUTES.map((minute) => (
                          <SelectItem key={minute} value={minute}>
                            {minute}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {validationError && (
          <div className="mt-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3">
            <p className="text-sm font-medium text-destructive">{validationError}</p>
          </div>
        )}

        {startSelection.date && endSelection.date && !validationError && (
          <div className="mt-6 rounded-lg border bg-muted/20 px-4 py-3">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">
                {translate("Période sélectionnée")} :
              </span>{" "}
              {format(
                startCombined!,
                withTime ? "d MMMM yyyy 'à' HH:mm" : "d MMMM yyyy",
                { locale: fr }
              )}
              {" → "}
              {format(
                endCombined!,
                withTime ? "d MMMM yyyy 'à' HH:mm" : "d MMMM yyyy",
                { locale: fr }
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
