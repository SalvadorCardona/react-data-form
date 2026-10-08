import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/ui/cn"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "[&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none",
        // Chrome paints autofilled fields with its own background: cover it with the
        // field's usual one, and keep the theme's text colour.
        "autofill:text-foreground autofill:[-webkit-text-fill-color:var(--foreground)] autofill:shadow-none autofill:[--tw-inset-shadow:inset_0_0_0_1000px_color-mix(in_oklab,var(--input)_50%,transparent),inset_0_0_0_1000px_var(--background)]",
        "h-9 w-full min-w-0 rounded-3xl border  bg-input/50 px-4 py-2 text-base transition-[color,box-shadow,background-color] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Input }
