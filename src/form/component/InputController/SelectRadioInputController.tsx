import { InputControllerInterface } from "@/form/InputControllerInterface"
import { cn } from "@/ui/cn"
import { Trans } from "react-mini-i18n"
import { Label } from "@/ui/label"
import { KeyboardEvent, useId } from "react"
import {
  SelectDecoratorPropsInterface,
  SelectFormInputInterface,
  SelectInputController,
  SelectItemPropsInterface,
} from "./SelectInputController"

const nextKeys = ["ArrowDown", "ArrowRight"]
const previousKeys = ["ArrowUp", "ArrowLeft"]

// Arrow keys move the focus and the selection to the next radio, looping
// at both ends, like a native radio group
const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
  const step = nextKeys.includes(event.key)
    ? 1
    : previousKeys.includes(event.key)
      ? -1
      : 0
  if (!step) return

  const radios = Array.from(
    event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]')
  )
  const current = radios.indexOf(document.activeElement as HTMLButtonElement)
  if (current === -1) return

  event.preventDefault()
  const next = radios[(current + step + radios.length) % radios.length]
  next.focus()
  next.click()
}

function RadioDecoratorComponent({
  children,
  formInput,
}: SelectDecoratorPropsInterface) {
  return (
    <div
      role="radiogroup"
      id={formInput?.id}
      className={"flex gap-2"}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  )
}

function RadioItemComponent({
  option,
  isSelected,
  onToggle,
  formInput,
}: SelectItemPropsInterface) {
  const id = useId()
  const options = formInput?.valueOptions ?? []
  const hasSelection = options.some((item) => item.value === formInput?.value)
  // Only one radio of the group is reachable with Tab: the selected one, or
  // the first one when nothing is selected yet
  const isTabbable = hasSelection ? isSelected : options[0]?.value === option.value

  return (
    <div className={cn("flex items-center space-x-2 gap-0.5", formInput?.className)}>
      <button
        type="button"
        role="radio"
        aria-checked={!!isSelected}
        data-state={isSelected ? "checked" : "unchecked"}
        id={id}
        tabIndex={isTabbable ? 0 : -1}
        className={cn(
          "aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          isSelected && "bg-primary text-primary-foreground"
        )}
        onClick={() => onToggle?.(option.value)}
      >
        {isSelected && (
          <span className="flex h-full w-full items-center justify-center">
            <span className="h-2 w-2 rounded-full bg-current" />
          </span>
        )}
      </button>
      <Label htmlFor={id}>
        <Trans>{option.label}</Trans>
      </Label>
    </div>
  )
}

export const SelectRadioInputController = (
  props: InputControllerInterface<SelectFormInputInterface>
) => {
  return (
    <SelectInputController
      {...props}
      formInput={{
        ...props.formInput,
        decoratorComponent: RadioDecoratorComponent,
        itemComponent: RadioItemComponent,
      }}
    />
  )
}
