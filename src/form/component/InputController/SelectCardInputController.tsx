import { InputControllerInterface } from "@/form/InputControllerInterface"
import { Trans } from "react-mini-i18n"
import { cn } from "@/ui/cn"
import {
  SelectFormInputInterface,
  SelectInputController,
  SelectItemPropsInterface,
} from "@/form/component/InputController/SelectInputController"

/**
 * Picker rendered as full-width cards stacked vertically, each with a title
 * and a description.
 * Plus lisible que `SelectButtonInputController` quand les options portent
 * une description.
 */
export const SelectCardInputController = (
  props: InputControllerInterface<SelectFormInputInterface>
) => {
  const formInput = props.formInput

  formInput.decoratorComponent = ({ children }) => {
    return <div className={"flex w-full flex-col gap-2"}>{children}</div>
  }

  formInput.itemComponent = ({
    option,
    isSelected,
    onToggle,
  }: SelectItemPropsInterface) => {
    return (
      <button
        key={option.value + "option.value"}
        type="button"
        onClick={() => onToggle?.(option.value)}
        className={cn(
          "flex w-full items-center justify-between gap-3 rounded-lg border p-3 text-left transition",
          isSelected
            ? "border-primary border-2 bg-primary/5"
            : "border-border hover:border-primary/50"
        )}
      >
        <div>
          <div className={"font-medium"}>
            <Trans className={"fc"}>{option.label}</Trans>
          </div>
          {option.description && (
            <div className={"text-sm text-muted-foreground"}>
              <Trans className={"fc"}>{option.description}</Trans>
            </div>
          )}
        </div>
      </button>
    )
  }

  return <SelectInputController {...props} />
}
