import { InputControllerProps } from "@/form/InputControllerInterface"
import { Input } from "@/ui/input"
import {
  centimesToPrice,
  formatPrice,
  priceToCentimes,
} from "@/internal/price/price"
import { ChangeEvent, useEffect, useState } from "react"
import { cn } from "@/ui/cn"

const centimesToDisplay = (centimes: number | null | undefined): string => {
  if (centimes === null || centimes === undefined || Number.isNaN(centimes)) {
    return ""
  }
  return centimesToPrice(centimes).toString().replace(".", ",")
}

const parseDisplayToCentimes = (input: string): number | null => {
  const normalized = input.trim().replace(",", ".")
  if (normalized === "" || normalized === "-" || normalized === ".") {
    return null
  }
  const parsed = Number(normalized)
  if (Number.isNaN(parsed)) {
    return null
  }
  return priceToCentimes(parsed)
}

const VALID_INPUT_PATTERN = /^-?\d*[.,]?\d*$/

export const PriceInputController = ({
  formInput,
  onChange,
}: InputControllerProps<number | undefined | null>) => {
  const [displayValue, setDisplayValue] = useState<string>(() =>
    centimesToDisplay(formInput.value)
  )

  useEffect(() => {
    const externalCentimes =
      formInput.value === null ||
      formInput.value === undefined ||
      Number.isNaN(formInput.value)
        ? null
        : formInput.value
    if (parseDisplayToCentimes(displayValue) !== externalCentimes) {
      setDisplayValue(centimesToDisplay(externalCentimes))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formInput.value])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    if (!VALID_INPUT_PATTERN.test(inputValue)) {
      return
    }
    setDisplayValue(inputValue)
    onChange({ ...formInput, value: parseDisplayToCentimes(inputValue) })
  }

  if (formInput.readonly) {
    return <span> {formatPrice(Number(formInput.value ?? 0))} </span>
  }

  return (
    <div className="relative">
      <Input
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        className={cn("pr-8")}
        placeholder="0,00"
      />
      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
        €
      </span>
    </div>
  )
}
