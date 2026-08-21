import { GroupOption, ItemGroupOption } from "@/form/FormInterface"

export function getSortedItemGroup(option: GroupOption): ItemGroupOption[] {
  return [...option.itemGroups].sort((a, b) => a.order - b.order)
}
