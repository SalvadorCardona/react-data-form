import {
  FormBuiltInterface,
  FormInterfaceValueType,
} from "@/form/FormInterface"
import { FormInputInterface } from "@/form/FormInputInterface"
import { getDataFromForm } from "@/form/utils/getDataFromForm"
import getFormInputInForm from "@/form/utils/getFormInputInForm"
import { setDataFromKey } from "@/internal/utils/object/nestedProperty"

export function updateFormByFormInput<
  Data extends FormInterfaceValueType = FormInterfaceValueType,
>(
  form: FormBuiltInterface<Data>,
  newFormInput: FormInputInterface
): FormBuiltInterface<Data> {
  if (!form.inputs) {
    return form
  }

  if (!newFormInput?.name) {
    throw new Error("FormInput hasn't name")
  }
  const currentFormInput = getFormInputInForm(form, newFormInput.name)

  if (!currentFormInput) {
    console.warn("form input is not here :" + newFormInput.name)

    return form
  }

  const newFormInpu = {
    ...currentFormInput,
    ...newFormInput,
  }

  const updatedInputs = setDataFromKey(form.inputs, newFormInput.name, newFormInpu)

  const updatedForm = {
    ...form,
    inputs: updatedInputs,
  }

  currentFormInput.value = newFormInput.value

  // Recompute the data from the updated form
  updatedForm.data = getDataFromForm(updatedForm)
  form.data = updatedForm.data

  return updatedForm
}
