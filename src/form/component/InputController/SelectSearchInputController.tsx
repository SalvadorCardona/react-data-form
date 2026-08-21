import { InputControllerInterface } from "@/form/InputControllerInterface"
import { FormInputInterface } from "@/form/FormInputInterface"
import { BaseComboboxProps, ComboboxMulti } from "@/ui/comboboxMulti"

export type SelectInputControllerPropsInterface = BaseComboboxProps<string> &
  FormInputInterface

export const SelectSearchInputController = ({
  formInput,
  onChange,
}: InputControllerInterface<SelectInputControllerPropsInterface>) => {
  const change = (value: any) => {
    if (typeof value == "undefined") {
      value = null
    }
    onChange({ ...formInput, ...{ value } })
  }

  return (
    <Combobox
      key={formInput.id}
      defaultValue={formInput.value ?? ""}
      onChange={(e) => change(e)}
      valueOptions={formInput.valueOptions}
      onSearch={formInput.onSearch}
      readonly={formInput.readonly}
      placeholder={formInput.placeholder}
      canRemove={formInput.canRemove}
      canBeSearch={formInput.canBeSearch}
    />
  )
}

function Combobox({
  valueOptions,
  defaultValue,
  onChange,
  onSearch,
  readonly,
  placeholder,
  onRemove,
  canRemove,
  canBeSearch,
}: BaseComboboxProps<string>) {
  return (
    <ComboboxMulti
      defaultValue={defaultValue ? [defaultValue] : []}
      valueOptions={valueOptions}
      onChange={(values) => onChange && onChange(values[0])}
      onSearch={onSearch}
      oneValue={true}
      readonly={readonly}
      placeholder={placeholder}
      onRemove={onRemove}
      canRemove={canRemove}
      canBeSearch={canBeSearch}
    />
  )
}
