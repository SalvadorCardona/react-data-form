import InputControllerProvider from "@/form/component/InputControllerProvider"
import useFormContext from "@/form/provider/useFormContext"
import getFormInputsFromForm from "@/form/utils/getFormInputsFromForm"
import { SectionCard } from "@/ui/SectionCard"

import { getSortedItemGroup } from "@/group/getSortedItemGroup"

export function FormInputsGroup() {
  const formContext = useFormContext()
  const form = formContext.form
  const groupsOption = form.groupOption
  const items = getSortedItemGroup(groupsOption ?? { itemGroups: [] })

  if (items.length === 0) {
    console.warn("FormInputsGroup: No group options found.")
    return null
  }

  return (
    <>
      {items.map((item) => {
        const inputs = getFormInputsFromForm({ ...form, groups: [item.group] })

        return (
          <SectionCard className={"mt-5"} key={item.group + "form-groups"} {...item}>
            {inputs.map((formInput) => {
              return (
                <InputControllerProvider
                  key={(formInput?.id as string) + formInput?.name + form.version}
                  formInput={formInput}
                />
              )
            })}
          </SectionCard>
        )
      })}
    </>
  )
}
