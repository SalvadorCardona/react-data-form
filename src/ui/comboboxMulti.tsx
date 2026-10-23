import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover"
import { Button } from "@/ui/button"
import { useEffect, useRef, useState } from "react"

import {
  getValueOptionByGroup,
  getValueOptionFromValue,
  ValueOptionInterface,
} from "@/form/utils/valueOption"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/ui/command"
import { addValue, removeValue } from "@/internal/utils/array/array"
import { Text } from "@/ui/Text"
import { translate } from "react-mini-i18n"
import { ChevronDown, CircleX } from "lucide-react"
import { LittleLoader } from "@/ui/Loader"
import { Trans } from "react-mini-i18n"
import { cn } from "@/ui/cn"
import useFormContext from "@/form/provider/useFormContext"
import { isApiIri } from "jsonld-item"
import { getPorts } from "@/ports"
import { FormInputInterface } from "@/form/FormInputInterface"
import { Badge } from "@/ui/badge"

function hasValue<T>(array: T[], value: T) {
  return array.includes(value)
}

export interface BaseComboboxProps<ValueType> extends FormInputInterface {
  onChange?: (value: ValueType) => void
  defaultValue?: ValueType
  canRemove?: boolean
  onRemove?: () => void
  canBeSearch?: boolean
  hasGroups?: boolean
}

export interface ComboBoxMultiPropsInterface extends BaseComboboxProps<string[]> {
  hasBadge?: boolean
  limit?: number
  oneValue?: boolean
}

export function ComboboxMulti({
  placeholder,
  valueOptions: parentValuesOptions,
  defaultValue: ParentDefaultValues,
  onChange,
  limit,
  onSearch,
  oneValue,
  hasBadge,
  readonly,
  onRemove,
  canBeSearch,
  canRemove: ParentcanRemove,
  hasGroups,
}: ComboBoxMultiPropsInterface) {
  const formContext = useFormContext()
  const [isPending, setIsPending] = useState(false)
  const [searchFailed, setSearchFailed] = useState(false)
  const [open, setOpen] = useState(false)
  const [defaultValues, setDefaultValues] = useState<string[]>(
    ParentDefaultValues ?? []
  )
  const [search, setSearch] = useState<string>("")
  const [valuesOptions, setValuesOptions] = useState<ValueOptionInterface[] | null>(
    parentValuesOptions ?? null
  )
  const canRemove = ParentcanRemove ?? true

  useEffect(() => {
    if (parentValuesOptions) {
      setValuesOptions(parentValuesOptions)
    }
  }, [parentValuesOptions])

  const change = (values: string[]) => {
    setDefaultValues(values)
    setOpen(false)

    onChange?.(values)
  }

  const add = (value: string) => {
    if (!value) return

    if (oneValue) {
      change([value])
      return
    }

    const newValue = addValue(defaultValues, value)

    if (limit && defaultValues.length > limit) {
      change(newValue.slice(-limit))
      return
    }

    change(newValue)
  }

  const reset = () => {
    if (defaultValues.length === 0) return
    change([])
    onRemove?.()
  }

  const toggle = (value: string) => {
    if (hasValue(defaultValues, value)) {
      change(removeValue(defaultValues, value))
      return
    }

    add(value)
  }

  const getListValueOptions = (): ValueOptionInterface[] => {
    if (!valuesOptions) {
      return []
    }
    const selectedValues = oneValue
      ? valuesOptions.filter((valueOption) =>
          hasValue(defaultValues, valueOption.value as string)
        )
      : []

    let unselectedValues = valuesOptions.filter(
      (valueOption) =>
        !hasValue(defaultValues, valueOption.value as string) &&
        typeof valueOption.label === "string" &&
        valueOption.label.toLowerCase().includes(search.toLowerCase())
    )
    /**
     * Feature for FC Label
     */
    if (valuesOptions.length > 0 && typeof valuesOptions[0].label === "object") {
      unselectedValues = valuesOptions.filter(
        (valueOption) => !hasValue(defaultValues, valueOption.value as string)
      )
    }

    return [...selectedValues, ...unselectedValues]
  }

  const getLabelByValue = (currentValue: string) => {
    const currentValueOption = getValueOptionFromValue(
      currentValue,
      valuesOptions ?? []
    )

    if (currentValueOption) {
      return translate(currentValueOption.label as string)
    }

    if (isApiIri(currentValue)) {
      const IriLabel = getPorts().components.iriLabel
      return <IriLabel iri={currentValue} />
    }

    return currentValue
  }

  const onOpen = (value: boolean) => {
    setSearch("")
    if (!valuesOptions && onSearch) {
      currentOnSearch("")
    }

    setOpen(value)
  }

  const getDefaultValue = () => {
    if (oneValue) {
      const currentValue = getLabelByValue(defaultValues[0])
      if (currentValue) {
        return currentValue
      }
    }

    if (defaultValues.length) {
      return translate("{{count}} selected", { count: defaultValues.length })
    }

    return (
      <Text variant="p" className={"text-muted-foreground"}>
        <Trans>{placeholder ?? "Select..."}</Trans>
      </Text>
    )
  }

  const currentOnSearch = (value: string) => {
    if (!onSearch) {
      setIsPending(false)
      return
    }

    setIsPending(true)
    onSearch(value, formContext)
      .then((valuesOptions) => {
        setValuesOptions(valuesOptions)
        setSearchFailed(false)
      })
      .catch(() => {
        // Left empty so that the next opening searches again.
        setValuesOptions(null)
        setSearchFailed(true)
      })
      .finally(() => setIsPending(false))
  }

  const [debouncedQuery, setDebouncedQuery] = useState(search)
  const isFirstSearch = useRef(true)

  useEffect(() => {
    // The initial search is run on opening, not on mount.
    if (isFirstSearch.current) {
      isFirstSearch.current = false
      return
    }

    setIsPending(true)

    const handler = setTimeout(() => {
      setDebouncedQuery(search)
    }, 500)

    return () => {
      clearTimeout(handler)
    }
  }, [search])

  const isFirstDebouncedQuery = useRef(true)

  useEffect(() => {
    if (isFirstDebouncedQuery.current) {
      isFirstDebouncedQuery.current = false
      return
    }

    currentOnSearch(debouncedQuery)
  }, [debouncedQuery])

  const listValueOptions = getListValueOptions()

  if (readonly) {
    return (
      <div className={"flex flex-wrap gap-2"}>
        {defaultValues.map((value) => (
          <Badge key={value} variant={"secondary"}>
            {getLabelByValue(value)}
          </Badge>
        ))}
      </div>
    )
  }

  return (
    <>
      <Popover open={open} onOpenChange={onOpen}>
        <div className="w-full flex">
          <PopoverTrigger
            render={
              <Button
                variant="outline"
                role="combobox"
                className={cn(
                  "grow justify-between border-r-1",
                  canRemove ? " rounded-r-none" : ""
                )}
                aria-expanded={open}
                onClick={() => setOpen(true)}
              />
            }
          >
            <div className={"fc"}>{getDefaultValue()}</div>

            <ChevronDown className=" h-4 w-4 shrink-0 opacity-50" />
          </PopoverTrigger>
          {canRemove && (
            <Button
              variant={"outline"}
              disabled={defaultValues.length === 0}
              className={"justify-items-end p-2 border-l-0 rounded-l-none"}
              onClick={reset}
            >
              <CircleX className={"w-5 h-5 cursor-pointer rounded-l-0"} />
            </Button>
          )}
        </div>
        <PopoverContent>
          <Command>
            {canBeSearch !== false && (
              <>
                <CommandInput
                  className={"w-full"}
                  placeholder={translate("Search...")}
                  onValueChange={(e) => setSearch(e)}
                />
                <CommandEmpty className={"flex justify-center pt-3"}>
                  {isPending && search && <LittleLoader />}
                  {!isPending && searchFailed && (
                    <Text variant="muted">
                      <Trans>Unable to load the options.</Trans>
                    </Text>
                  )}
                  {!isPending && !searchFailed && !listValueOptions.length && (
                    <Text variant="muted">
                      <Trans>Nothing found.</Trans>
                    </Text>
                  )}
                </CommandEmpty>
              </>
            )}
            <CommandList>
              <Group
                add={add}
                valueOptions={listValueOptions}
                hasGroups={hasGroups}
              />
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {hasBadge && (
        <div className={"flex flex-wrap gap-2 mt-1"}>
          {defaultValues.map((value) => {
            return (
              <Button
                key={value as string}
                size={"sm"}
                variant={"secondary"}
                onClick={() => toggle(value)}
              >
                {getLabelByValue(value)}
                <CircleX />
              </Button>
            )
          })}
        </div>
      )}
    </>
  )
}

function Group({
  valueOptions,
  add,
  hasGroups,
}: {
  valueOptions: ValueOptionInterface[]
  add: (value: string) => void
  hasGroups?: boolean
}) {
  if (!valueOptions?.length) return
  if (hasGroups) {
    const valueOptionsGrouped = getValueOptionByGroup(valueOptions)
    return (
      <>
        {Object.entries(valueOptionsGrouped).map(([group, groupOptions]) => {
          return (
            <CommandGroup key={`group-${group}`} value={group} heading={group}>
              {groupOptions.map((valueOption) => (
                <Item
                  add={add}
                  key={`${group}-${valueOption.value}`}
                  valueOption={valueOption}
                />
              ))}
            </CommandGroup>
          )
        })}
      </>
    )
  }

  return (
    <CommandGroup>
      {valueOptions.map((valueOption) => (
        <Item
          add={add}
          key={valueOption.value + "item-no-group"}
          valueOption={valueOption}
        />
      ))}
    </CommandGroup>
  )
}

function Item({
  valueOption,
  add,
}: {
  valueOption: ValueOptionInterface
  add: (value: string) => void
}) {
  return (
    <CommandItem
      value={((valueOption.value as string) + " " + valueOption.label) as string}
      onSelect={() => add(valueOption.value as string)}
    >
      {typeof valueOption.label === "string" ? (
        <div className={"fc cursor-pointer"}>
          <Trans>{valueOption.label}</Trans>
        </div>
      ) : (
        <div className={"cursor-pointer w-full hover:bg-primary-foreground p-1"}>
          {valueOption.label}
        </div>
      )}
    </CommandItem>
  )
}
