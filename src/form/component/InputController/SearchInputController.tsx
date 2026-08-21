import { useState } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/ui/input"
import { InputControllerProps } from "@/form/InputControllerInterface"
import { translate } from "react-mini-i18n"
import useDebounceCallback from "@/internal/hook/useDebounceCallback"
import { cn } from "@/ui/cn"

/**
 * Text search field: magnifier on the left, clear button on the right.
 *
 * The value is held locally and propagated with a delay: used as a list filter
 * (`saveOnChange`), every keystroke would otherwise fire a request.
 */
export const SearchInputController = ({
  formInput,
  onChange,
}: InputControllerProps<string>) => {
  const [value, setValue] = useState<string>((formInput.value as string) ?? "")

  const propagate = useDebounceCallback((newValue: string) => {
    onChange({ ...formInput, value: newValue })
  }, 300)

  const change = (newValue: string) => {
    setValue(newValue)
    propagate(newValue)
  }

  return (
    <div className={"relative w-full"}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        id={formInput.id}
        name={formInput.name}
        value={value}
        onChange={(event) => change(event.target.value)}
        placeholder={translate(formInput?.placeholder ?? "Search...")}
        readOnly={formInput.readonly}
        type={"text"}
        autoComplete={"off"}
        className={cn("pl-10", value && "pr-10")}
      />
      {value && (
        <button
          type="button"
          onClick={() => change("")}
          aria-label={translate("Effacer la recherche")}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  )
}
