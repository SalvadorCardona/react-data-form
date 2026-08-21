import { InputControllerInterface } from "@/form/InputControllerInterface"
import { cn } from "@/ui/cn"
import { Trans } from "react-mini-i18n"
import { Label } from "@/ui/label"
import {
  SelectFormInputInterface,
  SelectInputController,
  SelectItemPropsInterface,
} from "./SelectInputController"

export const SelectRadioInputController = (
  props: InputControllerInterface<SelectFormInputInterface>
) => {
  const formInput = props.formInput
  formInput.decoratorComponent = ({ children }) => {
    return <div className={"flex gap-2"}>{children}</div>
  }

  formInput.itemComponent = ({
    option,
    isSelected,
    onToggle,
  }: SelectItemPropsInterface) => {
    return (
      <div
        className={cn("flex items-center space-x-2 gap-0.5", formInput?.className)}
      >
        <button
          type="button"
          role="radio"
          aria-checked={isSelected}
          data-state={isSelected ? "checked" : "unchecked"}
          id={option.value as string}
          className={cn(
            "aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            isSelected && "bg-primary text-primary-foreground"
          )}
          onClick={() => onToggle?.(option.value)}
          {...props}
        >
          {isSelected && (
            <span className="flex h-full w-full items-center justify-center">
              <span className="h-2 w-2 rounded-full bg-current" />
            </span>
          )}
        </button>
        <Label>
          <Trans>{option.label}</Trans>
        </Label>
      </div>
    )
  }

  return <SelectInputController {...props} />
}
