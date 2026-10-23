import { InputControllerProps } from "@/form/InputControllerInterface"
import { Input } from "@/ui/input"
import {
  centimesToPrice,
  formatPrice,
  priceToCentimes,
} from "@/internal/price/price"
import { ChangeEvent, useEffect, useState } from "react"
import { cn } from "@/ui/cn"
import { getPorts } from "@/ports"
import { useFieldControlAria } from "@/form/component/FieldControlContext"

interface CurrencyFormat {
  symbol: string
  symbolBefore: boolean
  decimal: string
  fractionDigits: number
}

// Symbol, its position and the decimal separator follow the `intlLocale` and
// `currency` ports, the same way `formatPrice` renders the readonly value.
const getCurrencyFormat = (): CurrencyFormat => {
  const formatter = new Intl.NumberFormat(getPorts().intlLocale, {
    style: "currency",
    currency: getPorts().currency ?? "EUR",
  })
  const parts = formatter.formatToParts(1.5)
  const currencyIndex = parts.findIndex((part) => part.type === "currency")
  const integerIndex = parts.findIndex((part) => part.type === "integer")
  return {
    symbol: parts[currencyIndex]?.value ?? "",
    symbolBefore: currencyIndex < integerIndex,
    decimal: parts.find((part) => part.type === "decimal")?.value ?? ".",
    fractionDigits: formatter.resolvedOptions().maximumFractionDigits ?? 2,
  }
}

const centimesToDisplay = (
  centimes: number | null | undefined,
  decimal: string
): string => {
  if (centimes === null || centimes === undefined || Number.isNaN(centimes)) {
    return ""
  }
  return centimesToPrice(centimes).toString().replace(".", decimal)
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

const DECIMAL_INPUT_PATTERN = /^-?\d*[.,]?\d*$/
const INTEGER_INPUT_PATTERN = /^-?\d*$/

export const PriceInputController = ({
  formInput,
  onChange,
}: InputControllerProps<number | undefined | null>) => {
  const currencyFormat = getCurrencyFormat()
  const aria = useFieldControlAria()
  const [displayValue, setDisplayValue] = useState<string>(() =>
    centimesToDisplay(formInput.value, currencyFormat.decimal)
  )

  useEffect(() => {
    const externalCentimes =
      formInput.value === null ||
      formInput.value === undefined ||
      Number.isNaN(formInput.value)
        ? null
        : formInput.value
    if (parseDisplayToCentimes(displayValue) !== externalCentimes) {
      setDisplayValue(centimesToDisplay(externalCentimes, currencyFormat.decimal))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formInput.value])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const pattern =
      currencyFormat.fractionDigits > 0
        ? DECIMAL_INPUT_PATTERN
        : INTEGER_INPUT_PATTERN
    if (!pattern.test(inputValue)) {
      return
    }
    setDisplayValue(inputValue)
    onChange({ ...formInput, value: parseDisplayToCentimes(inputValue) })
  }

  if (formInput.readonly) {
    const value = formInput.value
    if (value === null || value === undefined || Number.isNaN(value)) {
      return <span>-</span>
    }
    return <span> {formatPrice(Number(value))} </span>
  }

  const symbol = (
    <span
      className={cn(
        "absolute top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground pointer-events-none",
        currencyFormat.symbolBefore ? "left-3" : "right-3"
      )}
    >
      {currencyFormat.symbol}
    </span>
  )
  const placeholder =
    currencyFormat.fractionDigits > 0
      ? `0${currencyFormat.decimal}${"0".repeat(currencyFormat.fractionDigits)}`
      : "0"

  return (
    <div className="relative">
      {currencyFormat.symbolBefore && symbol}
      <Input
        id={formInput.id}
        {...aria}
        type="text"
        inputMode={currencyFormat.fractionDigits > 0 ? "decimal" : "numeric"}
        value={displayValue}
        onChange={handleChange}
        className={cn(currencyFormat.symbolBefore ? "pl-8" : "pr-8")}
        placeholder={placeholder}
      />
      {!currencyFormat.symbolBefore && symbol}
    </div>
  )
}
