import { Primitive } from "@/internal/utils/type/Primitive"
import { Textarea } from "@/ui/textarea"
import { InputControllerInterface } from "@/form/InputControllerInterface"
import debounce from "@/internal/utils/debounce"
import { useFieldControlAria } from "@/form/component/FieldControlContext"

export const TextAreaInputController = ({
  formInput,
  onChange,
}: InputControllerInterface) => {
  const aria = useFieldControlAria()
  const change = debounce((value: Primitive) => {
    onChange({ ...formInput, ...{ value } })
  }, 200)

  return (
    <Textarea
      id={formInput.id}
      {...aria}
      name={formInput.name}
      readOnly={formInput.readonly}
      defaultValue={formInput.value}
      onChange={(e) => change(e.target.value)}
      placeholder={formInput.placeholder ?? "Votre message..."}
    />
  )
}
