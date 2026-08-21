import * as React from "react"
import { format } from "date-fns"
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
import { translate } from "react-mini-i18n"
import { getPorts } from "@/ports"
import getFormInputInForm from "@/form/utils/getFormInputInForm"

export interface DateRangeFormInputInterface extends FormInputInterface {
  startKey?: string
  endKey?: string
  /** Shows the time pickers (default: true). Set to false for all-day ranges. */
  withTime?: boolean
  /**
   * Key of a duration (in seconds) held in the form data.
   * When it is set and the end date is still empty, the end date is computed
   * from the start date plus that duration. Conversely, any change to the range
   * updates the duration so the two stay consistent.
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
 * Builds the end-date selection by adding a duration (in seconds) to the start
 * date. Used to derive an end date from a known duration.
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
 * End time suggested while nothing has been entered: start + duration when a
 * duration is known, otherwise the default end of day. The duration is ignored
 * when it overflows the day — the end date itself is picked in the
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
  if (!selection.date) return translate("Pick a date")
  return format(selection.date, "d MMM yyyy", { locale: getPorts().dateLocale })
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
    // While no date has been entered, the suggested end time follows the known
    // duration. Showing 5 p.m. for a one-hour slot suggested a range unrelated
    // to what was actually booked.
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

    // The duration must reflect the range actually chosen; otherwise an
    // inherited duration would contradict the entered end date and the API
    // would recompute it on save.
    if (formInputDuration && startDate && endDate) {
      onChange({
        ...formInputDuration,
        value: Math.round((endDate.getTime() - startDate.getTime()) / 1000),
      })
    }
  }

  // When the start date changes, the end date shifts by the same interval so
  // the duration is preserved. When no end date is set yet, it is derived from
  // the supplied duration.
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
      ? translate("The end date must be after the start date")
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
                {translate("Start date")}
              </Label>
            </div>

            <div className="space-y-3">
              <Popover open={startOpen} onOpenChange={setStartOpen}>
                {/* `render` merges the trigger into the button; nested, they
                    ils produiraient un <button> dans un <button>, HTML invalide
                    would produce a React hydration error. */}
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
                        // on the already-selected date: keep it.
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
                        // on the already-selected date: keep it.
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
                {translate("Selected range")}:
              </span>{" "}
              {format(
                startCombined!,
                withTime ? "d MMMM yyyy 'at' HH:mm" : "d MMMM yyyy",
                { locale: getPorts().dateLocale }
              )}
              {" → "}
              {format(
                endCombined!,
                withTime ? "d MMMM yyyy 'at' HH:mm" : "d MMMM yyyy",
                { locale: getPorts().dateLocale }
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
