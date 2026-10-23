import InputControllerProvider from "@/form/component/InputControllerProvider"
import { FormInputInterface } from "@/form/FormInputInterface"
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

  const knownGroups = items.map((item) => item.group)
  // Fields whose groups match no itemGroup would otherwise be rendered nowhere
  const ungroupedInputs = getFormInputsFromForm(form).filter(
    (formInput) => !formInput.groups?.some((group) => knownGroups.includes(group))
  )

  const renderInputs = (inputs: FormInputInterface[]) =>
    inputs.map((formInput) => {
      return (
        <InputControllerProvider
          key={(formInput?.id as string) + formInput?.name}
          formInput={formInput}
        />
      )
    })

  const ungroupedSection = ungroupedInputs.length > 0 && (
    <SectionCard className={"mt-5"}>{renderInputs(ungroupedInputs)}</SectionCard>
  )
  const ungroupedAtStart = groupsOption?.ungroupedPosition === "start"

  return (
    <>
      {ungroupedAtStart && ungroupedSection}
      {items.map((item) => {
        const inputs = getFormInputsFromForm({ ...form, groups: [item.group] })

        return (
          <SectionCard className={"mt-5"} key={item.group + "form-groups"} {...item}>
            {renderInputs(inputs)}
          </SectionCard>
        )
      })}
      {!ungroupedAtStart && ungroupedSection}
    </>
  )
}
