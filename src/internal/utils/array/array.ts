import { Primitive } from "@/internal/utils/type/Primitive"

export function getIndexByColumn<T>(
  array: T[],
  keyName: keyof T,
  keyValue: Primitive
): number {
  return array.findIndex((e) => e[keyName] === keyValue)
}

export function updateByIndex<T>(array: T[], index: number, data: T): T[] {
  const newArray = [...array] as T[]
  newArray[index] = data
  return newArray
}

export function removeByIndex<T>(array: T[], index: number): T[] {
  return array.filter((_, i) => i !== index)
}

export function removeByColumn<T>(
  array: T[],
  keyName: keyof T,
  keyValue: Primitive
): T[] {
  const index = getIndexByColumn(array, keyName, keyValue)

  return removeByIndex(array, index)
}

export function removeValue<T>(array: T[], value: T) {
  return array.filter((e) => e !== value)
}

export function addValue<T>(array: T[], value: T) {
  return [...array, value]
}

export function toggleValue<T>(array: T[], value: T) {
  return array.includes(value) ? removeValue(array, value) : addValue(array, value)
}
