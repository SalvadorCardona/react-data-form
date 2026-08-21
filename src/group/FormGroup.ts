import { createForm } from "@/form/utils/createForm"
import { FormBuiltInterface, FormInterface } from "@/form/FormInterface"
import { FormInputsGroup } from "@/group/FormInputsGroup"

export function createGroupForm(form: FormInterface): FormBuiltInterface {
  if (!form.groupOption?.itemGroups?.length) {
    throw new Error(
      "FormGroup: groupOption.itemGroups must be defined and non-empty"
    )
  }

  const formBuilt = createForm(form)

  formBuilt.components = {
    ...form.components,
    formInputs: FormInputsGroup,
  }

  return formBuilt
}
