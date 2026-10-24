import { InputControllerInterface } from "@/form/InputControllerInterface"
import { FormInputInterface } from "@/form/FormInputInterface"
import { cn } from "@/ui/cn"
import { FC, ReactNode, useState } from "react"
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
import { Trans, translate } from "react-mini-i18n"
import { Badge } from "@/ui/badge"
import { isApiIri } from "jsonld-item"
import { getPorts } from "@/ports"

export interface SelectFormInputInterface extends FormInputInterface {
  itemComponent?: FC<SelectItemPropsInterface>
  decoratorComponent?: FC<SelectDecoratorPropsInterface>
}

export interface SelectItemPropsInterface {
  option: ValueOptionInterface
  isSelected?: boolean
  onToggle?: (option: unknown) => void
  formInput?: SelectFormInputInterface
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

/**
 * Option standing for a stored value that `valueOptions` no longer offers
 * (option removed since, historical VAT rate…): without it the trigger would
 * read the placeholder while the value is still sent.
 */
function getMissingValueOption(value: unknown): ValueOptionInterface | undefined {
  if (value === null || value === undefined || value === "") return undefined

  const IriLabel = getPorts().components.iriLabel
  const label = isApiIri(value as string) ? (
    <IriLabel iri={value as string} />
  ) : (
    String(value)
  )

  return {
    value: value as ValueOptionInterface["value"],
    label: (
      <span className={"flex items-center gap-1.5"}>
        {label}
        <span className={"text-muted-foreground"}>
          (<Trans>Current value</Trans>)
        </span>
      </span>
    ),
  }
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
        <SelectValue placeholder={translate(placeholder)}>
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
  const valueOption = getValueOptionFromValue(
    formInput?.value,
    formInput?.valueOptions ?? []
  )
  const missingValueOption = valueOption
    ? undefined
    : getMissingValueOption(formInput?.value)

  // The item of a missing value stays listed once the user picks another
  // option: Base UI resets the value to null when the item count changes and
  // its previous value is gone. It also lets the user go back to it.
  const [keptMissingValue, setKeptMissingValue] = useState<unknown>()
  if (missingValueOption && keptMissingValue !== missingValueOption.value) {
    setKeptMissingValue(missingValueOption.value)
  }
  const listedMissingValueOption =
    missingValueOption ?? getMissingValueOption(keptMissingValue)

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
    // The empty option of a non-required field clears the value.
    if (value === null) {
      if (formInput?.value !== null && formInput?.value !== undefined) {
        onChange({ ...formInput, value: null })
      }
      return
    }
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

  const currentOption = valueOption ?? missingValueOption

  // Only the default dropdown gets the extra items: the card, button and radio
  // variants bring their own decorator.
  const isDefaultDecorator = !formInput.decoratorComponent
  const hasEmptyOption = formInput.valueOptions.some(
    (option) => option.value === null || option.value === ""
  )

  if (formInput?.readonly) {
    return (
      <Badge variant={"secondary"}>
        <Trans>{currentOption?.label}</Trans>
      </Badge>
    )
  }

  return (
    <div className={cn("flex")}>
      <CurrentDecoratorComponent
        onToggle={handleToggle}
        option={currentOption}
        placeholder={formInput.placeholder}
        formInput={formInput}
      >
        {isDefaultDecorator && !formInput.required && !hasEmptyOption && (
          <SelectItem value={null}>
            <Trans className={"fc text-muted-foreground"}>None</Trans>
          </SelectItem>
        )}
        {isDefaultDecorator && listedMissingValueOption && (
          <DefaultComponent
            option={listedMissingValueOption}
            formInput={formInput}
          />
        )}
        {formInput.valueOptions.map((option) => {
          // const isDisabled = !isSelected && isMaxReached
          const CurrentComponent =
            option.component ?? formInput.itemComponent ?? DefaultComponent

          return (
            <CurrentComponent
              option={option}
              key={JSON.stringify(option)}
              isSelected={isSelected(option.value as string)}
              onToggle={handleToggle}
              formInput={formInput}
            />
          )
        })}
      </CurrentDecoratorComponent>
    </div>
  )
}
