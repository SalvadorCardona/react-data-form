import { InputControllerInterface } from "@/form/InputControllerInterface"
import { FormInputInterface } from "@/form/FormInputInterface"
import { FC, ReactNode } from "react"
import { cn } from "@/ui/cn"
import { Button } from "@/ui/button"
import { Badge } from "@/ui/badge"
import { Trans } from "react-mini-i18n"
import { addValue, removeValue } from "@/internal/utils/array/array"
import { ValueOptionInterface } from "@/form/utils/valueOption"

export interface MultiSelectButtonFormInputInterface extends FormInputInterface {
  itemComponent?: FC<MultiSelectButtonItemPropsInterface>
  decoratorComponent?: FC<MultiSelectButtonDecoratorPropsInterface>
}

export interface MultiSelectButtonItemPropsInterface {
  option: ValueOptionInterface
  isSelected: boolean
  isDisabled: boolean
  onToggle: (value: string | number) => void
}

export interface MultiSelectButtonDecoratorPropsInterface {
  children: ReactNode
  formInput?: FormInputInterface
}

function DefaultItemComponent({
  option,
  isSelected,
  isDisabled,
  onToggle,
}: MultiSelectButtonItemPropsInterface) {
  return (
    <Button
      type="button"
      variant={isSelected ? "default" : "outline"}
      onClick={() => onToggle(option.value as string)}
      disabled={isDisabled}
    >
      <Trans>{option.label}</Trans>
    </Button>
  )
}

function DefaultDecoratorComponent({
  children,
}: MultiSelectButtonDecoratorPropsInterface) {
  return <div className={cn("flex flex-wrap gap-2")}>{children}</div>
}

export const MultiSelectInputController: FC<
  InputControllerInterface<MultiSelectButtonFormInputInterface>
> = ({ formInput, onChange }) => {
  if (!formInput?.valueOptions) {
    return <></>
  }

  const limit = formInput.max
  const currentValue = (formInput.value as (string | number)[]) ?? []

  const isSelected = (id: string) => currentValue.includes(id)

  const change = (value: (string | number)[]) => {
    onChange({ ...formInput, value })
  }

  const handleToggle = (newValue: string) => {
    if (isSelected(newValue)) {
      change(removeValue(currentValue, newValue))
      return
    }
    if (limit !== undefined && currentValue.length >= limit) {
      return
    }
    change(addValue(currentValue, newValue))
  }

  const isMaxReached = limit !== undefined && currentValue.length >= limit

  if (formInput?.readonly) {
    const selectedOptions = formInput.valueOptions.filter((option) =>
      isSelected(option.value as string)
    )
    return (
      <div className={cn("flex flex-wrap gap-2")}>
        {selectedOptions.map((option) => (
          <Badge key={JSON.stringify(option)} variant="secondary">
            <Trans>{option.label}</Trans>
          </Badge>
        ))}
      </div>
    )
  }

  const CurrentDecoratorComponent =
    formInput.decoratorComponent ?? DefaultDecoratorComponent

  return (
    <CurrentDecoratorComponent formInput={formInput}>
      {formInput.valueOptions.map((option) => {
        const isSelectedCurrent = isSelected(option.value as string)
        const isDisabled = !isSelectedCurrent && isMaxReached
        const CurrentItemComponent =
          option.component ?? formInput.itemComponent ?? DefaultItemComponent

        return (
          <CurrentItemComponent
            key={JSON.stringify(option) + JSON.stringify(currentValue)}
            option={option}
            isSelected={isSelectedCurrent}
            isDisabled={isDisabled}
            // @ts-expect-error true of my code
            onToggle={handleToggle}
          />
        )
      })}
    </CurrentDecoratorComponent>
  )
}
