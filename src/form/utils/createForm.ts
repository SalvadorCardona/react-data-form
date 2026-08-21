import {
  FormBuiltInterface,
  FormInterface,
  FormInterfaceValueType,
} from "@/form/FormInterface"
import { upsertForm } from "@/form/utils/upsertForm"

export function createForm<
  Data extends FormInterfaceValueType = FormInterfaceValueType,
>(
  form: Partial<FormInterface<Data>>,
  data: Data = {} as Data
): FormBuiltInterface<Data> {
  return upsertForm(form, data)
}

export function createFormAsync<
  Data extends FormInterfaceValueType = FormInterfaceValueType,
>(
  form: Partial<FormInterface<Data>>,
  data: Data | Promise<Data>
): FormBuiltInterface<Data> | Promise<FormBuiltInterface<Data>> {
  const maybePromise = data as any

  // Si data ressemble à une Promise (thenable)
  if (maybePromise && typeof maybePromise.then === "function") {
    return (maybePromise as Promise<Data>).then((resolved) =>
      upsertForm(form, resolved)
    )
  }

  // Sinon, data est un objet déjà résolu
  return upsertForm(form, data as Data)
}
