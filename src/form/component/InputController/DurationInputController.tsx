import { ChangeEvent, useEffect, useState } from "react"
import { InputControllerProps } from "@/form/InputControllerInterface"
import { Input } from "@/ui/input"

const SECONDS_PER_HOUR = 3600
const SECONDS_PER_MINUTE = 60

type DurationParts = { hours: string; minutes: string }

const secondsToParts = (seconds: number | null | undefined): DurationParts => {
  if (seconds === null || seconds === undefined || Number.isNaN(seconds)) {
    return { hours: "", minutes: "" }
  }
  const total = Math.max(0, Math.floor(seconds))
  const hours = Math.floor(total / SECONDS_PER_HOUR)
  const minutes = Math.floor((total % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE)
  return { hours: String(hours), minutes: String(minutes) }
}

const partsToSeconds = (parts: DurationParts): number | null => {
  if (parts.hours === "" && parts.minutes === "") {
    return null
  }
  const hours = Number(parts.hours || 0)
  const minutes = Number(parts.minutes || 0)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null
  }
  return hours * SECONDS_PER_HOUR + minutes * SECONDS_PER_MINUTE
}

const formatDuration = (seconds: number | null | undefined): string => {
  const { hours, minutes } = secondsToParts(seconds)
  if (hours === "" && minutes === "") return "-"
  const h = Number(hours)
  const m = Number(minutes)
  if (h > 0 && m > 0) return `${h}h ${m}min`
  if (h > 0) return `${h}h`
  return `${m}min`
}

const DIGITS_ONLY = /^\d*$/

export const DurationInputController = ({
  formInput,
  onChange,
}: InputControllerProps<number | null | undefined>) => {
  const [parts, setParts] = useState<DurationParts>(() =>
    secondsToParts(formInput.value)
  )

  useEffect(() => {
    if (partsToSeconds(parts) !== (formInput.value ?? null)) {
      setParts(secondsToParts(formInput.value))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formInput.value])

  const update = (next: DurationParts) => {
    setParts(next)
    onChange({ ...formInput, value: partsToSeconds(next) })
  }

  const handleHours = (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    if (!DIGITS_ONLY.test(v)) return
    update({ ...parts, hours: v })
  }

  const handleMinutes = (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    if (!DIGITS_ONLY.test(v)) return
    if (v !== "" && Number(v) > 59) return
    update({ ...parts, minutes: v })
  }

  if (formInput.readonly) {
    return <span>{formatDuration(formInput.value)}</span>
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative w-24">
        <Input
          type="text"
          inputMode="numeric"
          value={parts.hours}
          onChange={handleHours}
          placeholder="0"
          className="pr-8"
          aria-label="Hours"
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          h
        </span>
      </div>
      <div className="relative w-24">
        <Input
          type="text"
          inputMode="numeric"
          value={parts.minutes}
          onChange={handleMinutes}
          placeholder="0"
          className="pr-10"
          aria-label="Minutes"
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          min
        </span>
      </div>
    </div>
  )
}
