import { Checkbox } from "@/ui/checkbox"
import { InputControllerInterface } from "@/form/InputControllerInterface"
import { FormInputInterface } from "@/form/FormInputInterface"

export const BooleanInputController = ({
  formInput,
  onChange,
}: InputControllerInterface<FormInputInterface<boolean | null>>) => {
  const change = (value: boolean) => {
    onChange({ ...formInput, ...{ value: Boolean(value) } })
  }

  return (
    <div>
      <Checkbox
        name={formInput.name}
        defaultChecked={formInput?.value ?? false}
        onCheckedChange={(e) => change(e as boolean)}
        id={formInput.id}
      />
    </div>
  )
}
