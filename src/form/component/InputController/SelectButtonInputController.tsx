import { InputControllerInterface } from "@/form/InputControllerInterface"
import { Trans } from "@/i18n/components/Trans"
import { Button } from "@/ui/button"
import {
  SelectFormInputInterface,
  SelectInputController,
  SelectItemPropsInterface,
} from "@/form/component/InputController/SelectInputController"

export const SelectButtonInputController = (
  props: InputControllerInterface<SelectFormInputInterface>
) => {
  const formInput = props.formInput

  formInput.decoratorComponent = ({ children }) => {
    return <div className={"flex flex-wrap gap-1"}>{children}</div>
  }

  formInput.itemComponent = ({
    option,
    isSelected,
    onToggle,
  }: SelectItemPropsInterface) => {
    return (
      <Button
        key={option.value + "option.value"}
        type="button"
        variant={isSelected ? "default" : "outline"}
        onClick={() => onToggle?.(option.value)}
      >
        <Trans className={"fc"}>{option.label}</Trans>
      </Button>
    )
  }

  return <SelectInputController {...props} />
}
