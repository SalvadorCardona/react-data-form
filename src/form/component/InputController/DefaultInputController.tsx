import { Input } from "@/ui/input"
import { Primitive } from "@/internal/utils/type/Primitive"
import { InputControllerProps } from "@/form/InputControllerInterface"
import { translate } from "react-mini-i18n"

export const DefaultInputController = ({
  formInput,
  onChange,
}: InputControllerProps<Primitive>) => {
  const localChange = (value: string) => {
    let newValue: Primitive = value
    if (formInput.type === "number") {
      let numberValue = Number(value)
      if (typeof formInput.min === "number" && numberValue < formInput.min) {
        numberValue = formInput.min
      }
      if (typeof formInput.max === "number" && numberValue > formInput.max) {
        numberValue = formInput.max
      }
      newValue = numberValue
    }
    onChange({ ...formInput, ...{ value: newValue } })
  }

  return (
    <Input
      id={formInput.id}
      name={formInput.name}
      defaultValue={(formInput.value as string) ?? ""}
      onChange={(e) => localChange(e.target.value)}
      placeholder={translate(formInput?.placeholder ?? "")}
      type={formInput.type}
      min={formInput.type === "number" ? formInput.min : undefined}
      max={formInput.type === "number" ? formInput.max : undefined}
      autoComplete={formInput.autocomplete}
      required={formInput.required ? formInput.required : false}
      readOnly={formInput.readonly ? formInput.readonly : false}
    />
  )
}
