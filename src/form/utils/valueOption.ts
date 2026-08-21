import { Primitive } from "@/internal/utils/type/Primitive"
import { RecordOfAny } from "@/internal/utils/type/RecordOfAny"
import { FC, ReactNode } from "react"
import { JsonLDItem } from "jsonld-item"
import { createUniqId } from "jsonld-item"
import { SelectItemPropsInterface } from "@/form/component/InputController/SelectInputController"

export interface ValueOptionInterface<T extends object = any> {
  label: string | ReactNode
  component?: FC<SelectItemPropsInterface>
  description?: string
  value: Primitive
  original?: T
  group?: string
  aliases?: string[]
  className?: string
}

export function valueOptionMapper<D = RecordOfAny>(
  data: D[],
  label: keyof D,
  value: keyof D
): ValueOptionInterface[] {
  return data.map((item) => {
    return createValueOption({
      label: item[label] as string,
      value: item[value],
      original: item,
    }) as ValueOptionInterface
  })
}

export function valueOptionFromJsonLdCollection<
  D extends JsonLDItem<{ name?: string | null | undefined }>,
>(data: D[]): ValueOptionInterface[] {
  return valueOptionMapper(data, "name", "@id")
}

export function valueOptionFromArray(
  data: (string | number)[]
): ValueOptionInterface[] {
  return data.map((item) => {
    return createValueOption({
      label: item,
      value: item,
    }) as ValueOptionInterface
  })
}

function createValueOption({
  label,
  original,
  value,
}: Partial<ValueOptionInterface>): ValueOptionInterface {
  return {
    label: label ?? createUniqId(),
    value: value,
    original,
  }
}

export function getValueOptionFromValue<T extends object = any>(
  value: Primitive | undefined,
  options: ValueOptionInterface<T>[]
): ValueOptionInterface<T> | undefined {
  const strictMatch = options.find((option) => option.value === value)
  if (strictMatch) return strictMatch

  if (value === null || value === undefined) return undefined

  // Tolerate a type drift between the form value and the option values
  // (e.g. "0" vs 0); without it the selected option would not be found and
  // l'affichage retombe sur le placeholder.
  return options.find((option) => String(option.value) === String(value))
}

export function getValueOptionByGroup<T extends object = any>(
  options: ValueOptionInterface<T>[]
): Record<string, ValueOptionInterface<T>[]> {
  return options.reduce(
    (acc, option) => {
      const groupKey = option.group ?? "default" // Utilise "default" si group absent
      if (!acc[groupKey]) {
        acc[groupKey] = []
      }
      acc[groupKey].push(option)
      return acc
    },
    {} as Record<string, ValueOptionInterface<T>[]>
  )
}
