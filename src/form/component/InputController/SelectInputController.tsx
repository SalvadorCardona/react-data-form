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
import { Trans } from "@/i18n/components/Trans"
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
  placeholder = "Sélectionner",
  formInput,
}: SelectDecoratorPropsInterface) {
  return (
    <Select onValueChange={onToggle} value={(option?.value ?? null) as string}>
      <SelectTrigger className={"w-full"}>
        <SelectValue placeholder={placeholder}>
          <Trans className={"fc"}>
            {option?.label ?? formInput?.placeholder ?? "Sélectionner..."}
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
    // Base UI notifie aussi la re-sélection de l'option déjà choisie : ne pas
    // l'interpréter comme une désélection, sinon la valeur est vidée en silence
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
