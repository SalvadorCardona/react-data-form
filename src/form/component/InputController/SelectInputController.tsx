import { InputControllerInterface } from "@/form/InputControllerInterface"
import { FormInputInterface } from "@/form/FormInputInterface"
import { cn } from "@/ui/cn"
import { FC, ReactNode } from "react"
import {
  getValueOptionFromValue,
  ValueOptionInterface,
} from "@/form/utils/valueOption"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select"
import { Trans } from "react-mini-i18n"
import { Badge } from "@/ui/badge"

export interface SelectFormInputInterface extends FormInputInterface {
  itemComponent?: FC<SelectItemPropsInterface>
  decoratorComponent?: FC<SelectDecoratorPropsInterface>
}

export interface SelectItemPropsInterface {
  option: ValueOptionInterface
  isSelected?: boolean
  onToggle?: (option: unknown) => void
}

export interface SelectDecoratorPropsInterface {
  option?: ValueOptionInterface
  onToggle?: (option: unknown) => void
  children: ReactNode
  placeholder?: string
  formInput?: FormInputInterface
}

function DefaultComponent({ option }: SelectItemPropsInterface) {
  return (
    <SelectItem value={option.value as string}>
      <Trans className={"fc"}>{option.label}</Trans>
    </SelectItem>
  )
}

function DefaultDecoratorComponent({
  children,
  option,
  onToggle,
  placeholder = "Select",
  formInput,
}: SelectDecoratorPropsInterface) {
  return (
    <Select onValueChange={onToggle} value={(option?.value ?? null) as string}>
      <SelectTrigger className={"w-full"}>
        <SelectValue placeholder={placeholder}>
          <Trans className={"fc"}>
            {option?.label ?? formInput?.placeholder ?? "Select..."}
          </Trans>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>{children}</SelectGroup>
      </SelectContent>
    </Select>
  )
}

export const SelectInputController: FC<
  InputControllerInterface<SelectFormInputInterface>
> = ({ formInput, onChange }) => {
  if (!formInput?.valueOptions) {
    return <></>
  }

  const isSelected = (id: string) => {
    return formInput.value === id
  }

  const change = (value: string | number | undefined) => {
    onChange({ ...formInput, value })
  }

  const handleToggle = (value: unknown) => {
    // Base UI also reports re-selecting the option already chosen. Do not read
    // that as a deselection, or the value is silently cleared
    // et l'affichage retombe sur le placeholder.
    if (formInput?.value === value) {
      return
    }
    change(value as string)
  }

  const CurrentDecoratorComponent =
    formInput.decoratorComponent ?? DefaultDecoratorComponent

  const getLabelByValue = () => {
    return getValueOptionFromValue(formInput.value, formInput?.valueOptions ?? [])
  }

  if (formInput?.readonly) {
    return (
      <Badge variant={"secondary"}>
        <Trans>{getLabelByValue()?.label}</Trans>
      </Badge>
    )
  }

  return (
    <div className={cn("flex")}>
      <CurrentDecoratorComponent
        onToggle={handleToggle}
        option={getLabelByValue()}
        placeholder={formInput.placeholder}
        formInput={formInput}
      >
        {formInput.valueOptions.map((option) => {
          // const isDisabled = !isSelected && isMaxReached
          const CurrentComponent =
            option.component ?? formInput.itemComponent ?? DefaultComponent

          return (
            <CurrentComponent
              option={option}
              key={JSON.stringify(option) + formInput.value}
              isSelected={isSelected(option.value as string)}
              onToggle={handleToggle}
            />
          )
        })}
      </CurrentDecoratorComponent>
    </div>
  )
}
