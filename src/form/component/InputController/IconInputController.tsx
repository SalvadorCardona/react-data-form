import { useEffect, useRef, useState } from "react"
import { InputControllerProps } from "@/form/InputControllerInterface"
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover"
import { Button } from "@/ui/button"
import { cn } from "@/ui/cn"
import { Loader2, X } from "lucide-react"
import { ValueOptionInterface } from "@/form/utils/valueOption"
import { getEmojiValueOptions } from "@/form/component/InputController/getEmojiValueOptions"

/**
 * Icon picker based on native emojis: opens an emoji grid and
 * stores the chosen character. The grid is loaded asynchronously through
 * {@link getEmojiValueOptions} (ou via `formInput.valueOptions` si une liste
 * list is provided by the field).
 */
export function IconInputController({
  formInput,
  onChange,
}: InputControllerProps<string | null | undefined>) {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<ValueOptionInterface[]>(
    formInput.valueOptions ?? []
  )
  const [loading, setLoading] = useState(false)
  const loadStartedRef = useRef(false)
  const value = formInput.value ?? undefined

  // Emojis are loaded asynchronously the first time the popover opens, unless
  // a list was already provided through `valueOptions`.
  useEffect(() => {
    if (!open || options.length > 0 || loadStartedRef.current) {
      return
    }

    loadStartedRef.current = true
    setLoading(true)
    getEmojiValueOptions()
      .then((loaded) => setOptions(loaded))
      .finally(() => setLoading(false))
  }, [open, options.length])

  const select = (icon: string | undefined) => {
    onChange({ ...formInput, value: icon })
    setOpen(false)
  }

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button type="button" variant="outline" className="gap-2">
              <span className="text-lg leading-none">{value ?? "🙂"}</span>
              <span className="text-sm">
                {value ? "Change emoji" : "Pick an emoji"}
              </span>
            </Button>
          }
        />
        <PopoverContent className="w-72">
          {loading ? (
            <div className="flex h-32 items-center justify-center text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : (
            <div className="grid max-h-64 grid-cols-8 gap-1 overflow-y-auto">
              {options.map((option) => {
                const emoji = option.value as string

                return (
                  <button
                    key={emoji}
                    type="button"
                    title={emoji}
                    aria-label={emoji}
                    onClick={() => select(emoji)}
                    className={cn(
                      "flex aspect-square items-center justify-center rounded-md border border-transparent text-xl transition-colors hover:bg-accent",
                      value === emoji ? "border-primary bg-accent" : ""
                    )}
                  >
                    {emoji}
                  </button>
                )
              })}
            </div>
          )}
        </PopoverContent>
      </Popover>

      {value ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Remove emoji"
          onClick={() => select(undefined)}
        >
          <X className="h-4 w-4" />
        </Button>
      ) : null}
    </div>
  )
}
