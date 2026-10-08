import { Primitive } from "@/internal/utils/type/Primitive"
import { InputControllerInterface } from "@/form/InputControllerInterface"
import { useState } from "react"
import { cn } from "@/ui/cn"
import { Eye, EyeOff } from "lucide-react"
import { Input } from "@/ui/input"
import { translate } from "react-mini-i18n"

/**
 * Masked text field with a reveal toggle on the right.
 *
 * Keeps the look of the other text fields (same `Input`, no extra styling):
 * only `pr-10` is added to make room for the eye button.
 */
export const PasswordInputController = ({
  formInput,
  onChange,
}: InputControllerInterface) => {
  const [showPassword, setShowPassword] = useState(false)

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const change = (value: Primitive) => {
    onChange({ ...formInput, ...{ value } })
  }

  return (
    <div className={cn("relative w-full", formInput.className)}>
      <Input
        name={formInput.name}
        onChange={(e) => change(e.target.value)}
        defaultValue={(formInput.value as string) ?? ""}
        placeholder={translate(formInput.placeholder ?? "")}
        id={formInput.id ?? formInput.name}
        type={showPassword ? "text" : "password"}
        autoComplete={formInput.autocomplete ?? "current-password"}
        required={formInput.required ? formInput.required : false}
        readOnly={formInput.readonly ? formInput.readonly : false}
        className="pr-10"
      />
      <button
        type="button"
        onClick={togglePasswordVisibility}
        className="absolute right-3.5 top-1/2 z-10 -translate-y-1/2 rounded-full text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/30"
        aria-label={
          showPassword
            ? translate("Masquer le mot de passe")
            : translate("Afficher le mot de passe")
        }
      >
        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  )
}
