import { Checkbox } from "@/ui/checkbox"
import { InputControllerInterface } from "@/form/InputControllerInterface"
import { FormInputInterface } from "@/form/FormInputInterface"
import { useFieldControlAria } from "@/form/component/FieldControlContext"

export const BooleanInputController = ({
  formInput,
  onChange,
}: InputControllerInterface<FormInputInterface<boolean | null>>) => {
  const aria = useFieldControlAria()
  const change = (value: boolean) => {
    onChange({ ...formInput, ...{ value: Boolean(value) } })
  }

  return (
    <div>
      <Checkbox
        name={formInput.name}
        checked={formInput?.value ?? false}
        readOnly={formInput.readonly}
        onCheckedChange={(e) => change(e as boolean)}
        id={formInput.id}
        {...aria}
      />
    </div>
  )
}
