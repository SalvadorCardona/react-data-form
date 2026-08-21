import { useState } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/ui/input"
import { InputControllerProps } from "@/form/InputControllerInterface"
import translate from "@/i18n/translate"
import useDebounceCallback from "@/internal/hook/useDebounceCallback"
import { cn } from "@/ui/cn"

/**
 * Champ de recherche texte : loupe à gauche, bouton d'effacement à droite.
 *
 * La valeur est tenue en local et propagée avec un délai : utilisé comme filtre
 * de liste (`saveOnChange`), chaque frappe déclencherait sinon une requête.
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
        placeholder={translate(formInput?.placeholder ?? "Rechercher...")}
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
