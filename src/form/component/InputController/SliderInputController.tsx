import { Slider as SliderPrimitive } from "@base-ui/react/slider"
import { InputControllerInterface } from "@/form/InputControllerInterface"
import { FormInputInterface } from "@/form/FormInputInterface"
import { getPorts } from "@/ports"
import { cn } from "@/ui/cn"
import { Trans } from "react-mini-i18n"
import { useId } from "react"

export type SliderValue = number | [number, number] | null

export interface SliderFormInputInterface extends FormInputInterface<SliderValue> {
  /** Gap between two reachable values (default 1). */
  step?: number
  /** Two thumbs: the value is a `[start, end]` pair. */
  range?: boolean
}

const formatNumber = (value: number) =>
  new Intl.NumberFormat(getPorts().intlLocale).format(value)

// "-" when nothing is picked yet, "2 – 8" for a range
const formatSliderValue = (value: SliderValue | undefined): string => {
  if (Array.isArray(value)) return value.map(formatNumber).join(" – ")
  if (typeof value === "number" && !Number.isNaN(value)) return formatNumber(value)
  return "-"
}

export const SliderInputController = ({
  formInput,
  onChange,
}: InputControllerInterface<SliderFormInputInterface>) => {
  const min = formInput.min ?? 0
  const max = formInput.max ?? 100
  const value = formInput.value
  const thumbLabelId = useId()

  if (formInput.readonly) {
    return <span>{formatSliderValue(value)}</span>
  }

  // Without a value yet, the thumbs rest at the bounds
  const thumbs: number[] = formInput.range
    ? Array.isArray(value)
      ? value
      : [min, max]
    : [typeof value === "number" ? value : min]

  const change = (next: number | readonly number[]) => {
    const values = Array.isArray(next) ? next : [next]
    onChange({
      ...formInput,
      value: formInput.range ? [values[0], values[1]] : values[0],
    })
  }

  const labelId = formInput.id && `${formInput.id}-label`

  return (
    <div className="flex items-center gap-3">
      <SliderPrimitive.Root
        id={formInput.id}
        aria-labelledby={labelId}
        className={cn("w-full", formInput.className)}
        value={thumbs}
        min={min}
        max={max}
        step={formInput.step ?? 1}
        thumbAlignment="edge"
        onValueChange={change}
      >
        <SliderPrimitive.Control className="relative flex w-full touch-none items-center select-none">
          <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-input/90 select-none">
            <SliderPrimitive.Indicator className="h-full bg-primary select-none" />
          </SliderPrimitive.Track>
          {thumbs.map((_, index) => (
            <SliderPrimitive.Thumb
              key={index}
              index={index}
              // A range names each thumb after the field and its role in it
              aria-labelledby={
                formInput.range
                  ? [labelId, `${thumbLabelId}-${index}`].filter(Boolean).join(" ")
                  : labelId
              }
              className="block h-4 w-6 shrink-0 rounded-full bg-white shadow-md ring-1 ring-black/10 transition-[color,box-shadow,background-color] select-none not-dark:bg-clip-padding hover:ring-4 hover:ring-ring/30 focus-visible:ring-4 focus-visible:ring-ring/30 focus-visible:outline-hidden"
            />
          ))}
        </SliderPrimitive.Control>
      </SliderPrimitive.Root>
      {formInput.range && (
        <>
          <span id={`${thumbLabelId}-0`} className="sr-only">
            <Trans>Minimum</Trans>
          </span>
          <span id={`${thumbLabelId}-1`} className="sr-only">
            <Trans>Maximum</Trans>
          </span>
        </>
      )}
      <output
        htmlFor={formInput.id}
        className="min-w-12 shrink-0 text-right text-sm tabular-nums"
      >
        {formatSliderValue(value)}
      </output>
    </div>
  )
}
