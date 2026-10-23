import { useEffect, useState } from "react"

import { cn } from "@/ui/cn"

interface BlockOrderInputProps {
  value?: number
  onChange: (value: number) => void
  className?: string
  label?: string
}

/**
 * Compact order control shown in the header of a page-builder block.
 * Replaces the full-width "Order" field with a small numeric pill prefixed
 * de « # ».
 *
 * The value is committed on blur or Enter, not on every keystroke: the order
 * moves the block, and typing "12" must not move it to 1 first.
 */
export const BlockOrderInput = ({
  value,
  onChange,
  className,
  label,
}: BlockOrderInputProps) => {
  const [draft, setDraft] = useState<string>(value != null ? String(value) : "")

  useEffect(() => {
    setDraft(value != null ? String(value) : "")
  }, [value])

  const commit = () => {
    if (draft === "" || Number(draft) === value) {
      setDraft(value != null ? String(value) : "")
      return
    }
    onChange(Number(draft))
  }

  return (
    <label
      className={cn(
        "flex h-7 items-center gap-0.5 rounded-full border border-border bg-background pr-1 pl-2 text-xs font-medium text-muted-foreground transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30",
        className
      )}
      title={label}
      aria-label={label}
    >
      <span className="select-none text-muted-foreground/60">#</span>
      <input
        type="number"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            // Enter commits the order, it does not submit the whole form.
            event.preventDefault()
            commit()
          }
          if (event.key === "Escape") {
            setDraft(value != null ? String(value) : "")
          }
        }}
        onClick={(event) => event.stopPropagation()}
        className="w-9 bg-transparent text-center tabular-nums text-foreground outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
    </label>
  )
}
