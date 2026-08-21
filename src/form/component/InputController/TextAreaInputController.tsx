import { Primitive } from "@/internal/utils/type/Primitive"
import { Textarea } from "@/ui/textarea"
import { InputControllerInterface } from "@/form/InputControllerInterface"
import debounce from "@/internal/utils/debounce"

export const TextAreaInputController = ({
  formInput,
  onChange,
}: InputControllerInterface) => {
  const change = debounce((value: Primitive) => {
    onChange({ ...formInput, ...{ value } })
  }, 200)

  return (
    <Textarea
      id={formInput.id}
      name={formInput.name}
      readOnly={formInput.readonly}
      defaultValue={formInput.value}
      onChange={(e) => change(e.target.value)}
      placeholder={formInput.placeholder ?? "Votre message..."}
    />
  )
}
