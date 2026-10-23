import { InputControllerInterface } from "@/form/InputControllerInterface"
import { Trans } from "react-mini-i18n"
import { Button } from "@/ui/button"
import {
  SelectDecoratorPropsInterface,
  SelectFormInputInterface,
  SelectInputController,
  SelectItemPropsInterface,
} from "@/form/component/InputController/SelectInputController"

function ButtonDecoratorComponent({ children }: SelectDecoratorPropsInterface) {
  return <div className={"flex flex-wrap gap-1"}>{children}</div>
}

function ButtonItemComponent({
  option,
  isSelected,
  onToggle,
}: SelectItemPropsInterface) {
  return (
    <Button
      type="button"
      variant={isSelected ? "default" : "outline"}
      onClick={() => onToggle?.(option.value)}
    >
      <Trans className={"fc"}>{option.label}</Trans>
    </Button>
  )
}

export const SelectButtonInputController = (
  props: InputControllerInterface<SelectFormInputInterface>
) => {
  return (
    <SelectInputController
      {...props}
      formInput={{
        ...props.formInput,
        decoratorComponent: ButtonDecoratorComponent,
        itemComponent: ButtonItemComponent,
      }}
    />
  )
}
