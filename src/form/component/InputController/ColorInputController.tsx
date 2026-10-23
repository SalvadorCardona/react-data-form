import { ChangeEvent, useEffect, useState } from "react"
import { InputControllerProps } from "@/form/InputControllerInterface"
import { Input } from "@/ui/input"
import { cn } from "@/ui/cn"
import { Trans, translate } from "react-mini-i18n"

const HEX_COLOR = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i
const HEX_INPUT = /^#?[0-9a-f]{0,6}$/i

// "#ABC", "abc" or "#aabbcc" all become "#aabbcc"; anything else is no color
const normalizeColor = (value: unknown): string | null => {
  if (typeof value !== "string") return null
  const match = value.trim().match(HEX_COLOR)
  if (!match) return null
  const digits = match[1].toLowerCase()
  return `#${
    digits.length === 3
      ? digits
          .split("")
          .map((digit) => digit + digit)
          .join("")
      : digits
  }`
}

function ColorSwatch({ color, className }: { color: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("inline-block size-4 shrink-0 rounded-sm border", className)}
      style={{ backgroundColor: color }}
    />
  )
}

export const ColorInputController = ({
  formInput,
  onChange,
}: InputControllerProps<string | null>) => {
  const color = normalizeColor(formInput.value)
  const [hex, setHex] = useState(color ?? "")

  // Follows a value changed from outside, unless it is the one being typed
  useEffect(() => {
    if (normalizeColor(hex) !== color) setHex(color ?? "")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color])

  const update = (value: string | null) => {
    onChange({ ...formInput, value })
  }

  // An incomplete code stays on screen; the form only gets a color, or null
  const handleHex = (e: ChangeEvent<HTMLInputElement>) => {
    const typed = e.target.value
    if (!HEX_INPUT.test(typed)) return
    setHex(typed)
    if (typed === "" || normalizeColor(typed)) update(normalizeColor(typed))
  }

  const pick = (value: string) => {
    setHex(value)
    update(value)
  }

  if (formInput.readonly) {
    if (!color) return <span>-</span>
    return (
      <span className="inline-flex items-center gap-2">
        <ColorSwatch color={color} />
        <span className="font-mono text-sm">{color}</span>
      </span>
    )
  }

  const palette = formInput.valueOptions ?? []

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <input
          type="color"
          id={formInput.id}
          name={formInput.name}
          value={color ?? "#000000"}
          onChange={(e) => pick(e.target.value)}
          required={formInput.required}
          className="h-9 w-12 shrink-0 cursor-pointer rounded-md border bg-transparent p-1"
        />
        <Input
          type="text"
          value={hex}
          onChange={handleHex}
          placeholder="#000000"
          aria-label={translate("Hexadecimal code")}
          className="w-32 font-mono"
          spellCheck={false}
          autoComplete="off"
        />
      </div>
      {palette.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {palette.map((option) => {
            const optionColor = normalizeColor(option.value)
            if (!optionColor) return null
            const isSelected = optionColor === color
            return (
              <button
                key={optionColor}
                type="button"
                aria-pressed={isSelected}
                title={
                  typeof option.label === "string"
                    ? translate(option.label)
                    : undefined
                }
                onClick={() => pick(optionColor)}
                className={cn(
                  "rounded-md p-0.5 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isSelected && "ring-2 ring-primary"
                )}
              >
                <ColorSwatch color={optionColor} className="size-6" />
                <span className="sr-only">
                  <Trans>{option.label}</Trans>
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
