import {
  FormBuiltInterface,
  FormInterfaceValueType,
} from "@/form/FormInterface"
import getFormInputsFromForm from "@/form/utils/getFormInputsFromForm"
import { createViolation, isZodError } from "@/form/Violation"

export function validateForm<
  Data extends FormInterfaceValueType = FormInterfaceValueType,
>(form: FormBuiltInterface<Data>): FormBuiltInterface<Data> {
  const newForm = { ...form }

  if (!newForm.inputs) return newForm
  getFormInputsFromForm(newForm)
    .filter((e) => e.generatedValue !== true)
    .forEach((formInput) => {
      if (!formInput?.name) {
        return
      }

      const currentFormInput = newForm.inputs[formInput.name]
      currentFormInput.violations = []

      if (currentFormInput?.validator) {
        try {
          currentFormInput.validator(currentFormInput.value)
        } catch (error) {
          if (error instanceof Error) {
            if (isZodError(error)) {
              error?.issues?.forEach((e) =>
                currentFormInput?.violations?.push(
                  createViolation({
                    propertyPath: formInput.name,
                    code: e.code,
                    message: e.message,
                  })
                )
              )
            } else {
              currentFormInput.violations.push(
                createViolation({ message: error.message })
              )
            }
          } else {
            currentFormInput.violations.push(
              createViolation({ message: "Unknown error" })
            )
          }
        }
      }
    })

  return newForm
}
