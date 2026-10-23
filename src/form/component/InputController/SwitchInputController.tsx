import { InputControllerInterface } from "@/form/InputControllerInterface"
import { FormInputInterface } from "@/form/FormInputInterface"
import { Switch } from "@/ui/switch"
import { useFieldControlAria } from "@/form/component/FieldControlContext"

export const SwitchInputController = ({
  formInput,
  onChange,
}: InputControllerInterface<FormInputInterface<boolean | null>>) => {
  const aria = useFieldControlAria()
  const change = (value: boolean) => {
    onChange({ ...formInput, ...{ value: Boolean(value) } })
  }

  return (
    <div>
      <Switch
        id={formInput.id}
        {...aria}
        name={formInput.name}
        aria-label={
          typeof formInput.label === "string" ? formInput.label : undefined
        }
        checked={formInput?.value ?? false}
        readOnly={formInput.readonly}
        onCheckedChange={(e) => change(e as boolean)}
      />
    </div>
  )
}
