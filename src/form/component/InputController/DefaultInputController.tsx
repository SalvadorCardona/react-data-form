import { Input } from "@/ui/input"
import { Primitive } from "@/internal/utils/type/Primitive"
import { InputControllerProps } from "@/form/InputControllerInterface"
import { translate } from "react-mini-i18n"
import { useFieldControlAria } from "@/form/component/FieldControlContext"

export const DefaultInputController = ({
  formInput,
  onChange,
}: InputControllerProps<Primitive>) => {
  const aria = useFieldControlAria()
  const localChange = (value: string) => {
    let newValue: Primitive = value
    if (formInput.type === "number") {
      // "" or a partial number ("-") is no value; bounds are checked by validateForm
      const numberValue = value.trim() === "" ? NaN : Number(value)
      newValue = Number.isNaN(numberValue) ? null : numberValue
    }
    onChange({ ...formInput, ...{ value: newValue } })
  }

  return (
    <Input
      id={formInput.id}
      {...aria}
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
