import {
  FormBuiltInterface,
  FormInterfaceValueType,
} from "@/form/FormInterface"
import { upsertForm } from "@/form/utils/upsertForm"

export function updateForm<
  Data extends FormInterfaceValueType = FormInterfaceValueType,
>(
  form: FormBuiltInterface<Data>,
  data: Data,
  partial: boolean = true
): FormBuiltInterface<Data> {
  return upsertForm(form, data, { partial })
}
