import {
  ComboboxMulti,
  ComboBoxMultiPropsInterface,
} from "@/ui/comboboxMulti"
import { InputControllerInterface } from "@/form/InputControllerInterface"
import { FormInputInterface } from "@/form/FormInputInterface"

type SelectInputControllerPropsInterface = ComboBoxMultiPropsInterface &
  FormInputInterface

export const MultiSelectSearchInputController = ({
  formInput,
  onChange,
}: InputControllerInterface<SelectInputControllerPropsInterface>) => {
  const change = (value: string[]) => {
    onChange({ ...formInput, ...{ value: value } })
  }

  return (
    <ComboboxMulti
      key={JSON.stringify(formInput)}
      defaultValue={formInput.value}
      onChange={(e) => change(e)}
      valueOptions={formInput.valueOptions}
      hasBadge={true}
      placeholder={formInput.placeholder}
      onSearch={formInput.onSearch}
      hasGroups={formInput.hasGroups}
    />
  )
}
