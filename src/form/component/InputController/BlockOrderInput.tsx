
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
 */
export const BlockOrderInput = ({
  value,
  onChange,
  className,
  label,
}: BlockOrderInputProps) => {
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
        value={value ?? ""}
        onChange={(event) => onChange(Number(event.target.value))}
        onClick={(event) => event.stopPropagation()}
        className="w-9 bg-transparent text-center tabular-nums text-foreground outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
    </label>
  )
}
