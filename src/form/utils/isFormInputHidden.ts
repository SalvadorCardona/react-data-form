import { FormBuiltInterface, FormInterface } from "@/form/FormInterface"
import { FormInputInterface } from "@/form/FormInputInterface"

/**
 * Whether the input is hidden: of type "hidden", or hidden by its `hidden`
 * function given the current data of the form.
 */
export function isFormInputHidden(
  formInput: FormInputInterface,
  form: FormInterface | FormBuiltInterface
): boolean {
  return (
    formInput.type === "hidden" ||
    formInput.hidden?.(form.data ?? {}, form as FormBuiltInterface) === true
  )
}
