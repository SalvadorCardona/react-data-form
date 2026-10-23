import { FormBuiltInterface, FormInterfaceValueType } from "@/form/FormInterface"
import { FormInputInterface } from "@/form/FormInputInterface"
import { getDataFromForm } from "@/form/utils/getDataFromForm"
import getFormInputInForm from "@/form/utils/getFormInputInForm"
import {
  isNestedProperty,
  setDataFromKey,
} from "@/internal/utils/object/nestedProperty"

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

  const updatedFormInput = {
    ...currentFormInput,
    ...newFormInput,
  }

  // The input is replaced where getFormInputInForm found it: a dotted name may
  // be a plain key as well as a nested path.
  const updatedInputs = isNestedProperty(form.inputs, newFormInput.name)
    ? setDataFromKey(form.inputs, newFormInput.name, updatedFormInput)
    : { ...form.inputs, [newFormInput.name]: updatedFormInput }

  const updatedForm = {
    ...form,
    inputs: updatedInputs,
  }

  // Recompute the data from the updated form
  return { ...updatedForm, data: getDataFromForm(updatedForm) }
}
