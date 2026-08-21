import { FormInterface, FormInterfaceValueType } from "@/form/FormInterface"
import getFormInputsFromForm from "@/form/utils/getFormInputsFromForm"

export function getDataFromForm<
  Data extends FormInterfaceValueType = FormInterfaceValueType,
>(form: FormInterface<Data>): Data {
  const data = {} as Data

  getFormInputsFromForm(form, false).forEach((formInput) => {
    data[formInput.name as keyof Data] = formInput.value
  })

  return data as Required<Data>
}
