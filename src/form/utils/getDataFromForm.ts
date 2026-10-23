import {
  FormBuiltInterface,
  FormInterface,
  FormInterfaceValueType,
} from "@/form/FormInterface"
import getFormInputsFromForm from "@/form/utils/getFormInputsFromForm"

export interface GetDataFromFormOptions {
  /**
   * Leaves out the inputs hidden by their `hidden` function, unless they set
   * `keepHiddenValue`: the data sent on submission. Inputs of type "hidden"
   * are always kept.
   */
  withoutHiddenValues?: boolean
}

export function getDataFromForm<
  Data extends FormInterfaceValueType = FormInterfaceValueType,
>(
  form: FormInterface<Data> | FormBuiltInterface<Data>,
  { withoutHiddenValues = false }: GetDataFromFormOptions = {}
): Data {
  const data = {} as Data

  getFormInputsFromForm(form, false).forEach((formInput) => {
    if (
      withoutHiddenValues &&
      !formInput.keepHiddenValue &&
      formInput.type !== "hidden" &&
      formInput.hidden?.(form.data ?? ({} as Data), form as FormBuiltInterface<Data>)
    ) {
      return
    }

    data[formInput.name as keyof Data] = formInput.value
  })

  return data as Required<Data>
}
