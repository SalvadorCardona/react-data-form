import { FormInterface } from "@/form/FormInterface"
import { FormInputInterface } from "@/form/FormInputInterface"
import { getDataFromKey } from "@/internal/utils/object/nestedProperty"

export default function getFormInputInForm(
  form: FormInterface,
  formInputName: string
): FormInputInterface | undefined {
  if (!form?.inputs) return undefined

  return getDataFromKey<FormInterface, FormInputInterface>(
    form.inputs,
    formInputName
  )
}
