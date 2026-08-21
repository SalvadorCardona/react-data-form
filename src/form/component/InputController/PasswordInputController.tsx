import { Primitive } from "@/internal/utils/type/Primitive"
import { InputControllerInterface } from "@/form/InputControllerInterface"
import { useState } from "react"
import { cn } from "@/ui/cn"
import { Eye, EyeOff, Lock } from "lucide-react"
import { Input } from "@/ui/input"

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
    <div className={cn("w-full space-y-2 relative", formInput.className)}>
      <Lock
        className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-200 text-muted-foreground`}
      />
      <Input
        name={formInput.name}
        onChange={(e) => change(e.target.value)}
        defaultValue={(formInput.value as string) ?? ""}
        placeholder={formInput.placeholder ?? "..."}
        id={formInput.id ?? "password"}
        type={showPassword ? "text" : "password"}
        autoComplete={formInput.autocomplete ?? "current-password"}
        className="pl-12 h-14 bg-input border-border rounded-xl text-base placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
      />
      <button
        type="button"
        onClick={togglePasswordVisibility}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors z-80"
        aria-label={
          showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"
        }
      >
        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
  )
}
