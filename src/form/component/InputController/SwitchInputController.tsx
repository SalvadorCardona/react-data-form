import { InputControllerInterface } from "@/form/InputControllerInterface"
import { FormInputInterface } from "@/form/FormInputInterface"
import { Switch } from "@/ui/switch"

export const SwitchInputController = ({
  formInput,
  onChange,
}: InputControllerInterface<FormInputInterface<boolean | null>>) => {
  const change = (value: boolean) => {
    onChange({ ...formInput, ...{ value: Boolean(value) } })
  }

  return (
    <div>
      <Switch
        id={formInput.id}
        name={formInput.name}
        aria-label={
          typeof formInput.label === "string" ? formInput.label : undefined
        }
        defaultChecked={formInput?.value ?? false}
        onCheckedChange={(e) => change(e as boolean)}
      />
    </div>
  )
}
