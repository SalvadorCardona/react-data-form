import { FormBuiltInterface, FormInterfaceValueType } from "@/form/FormInterface"
import getFormInputsFromForm from "@/form/utils/getFormInputsFromForm"
import ViolationInterface, { createViolation, isZodError } from "@/form/Violation"
import { FormInputInterface } from "@/form/FormInputInterface"
import { translate } from "react-mini-i18n"
import { isFormInputHidden } from "@/form/utils/isFormInputHidden"

// false and 0 are answers, not missing values
function isEmptyValue(value: unknown): boolean {
  return (
    value === undefined ||
    value === null ||
    value === "" ||
    (Array.isArray(value) && value.length === 0)
  )
}

export function validateForm<
  Data extends FormInterfaceValueType = FormInterfaceValueType,
>(form: FormBuiltInterface<Data>): FormBuiltInterface<Data> {
  if (!form.inputs) return { ...form }

  // Every validated input is copied: the inputs of the given form are left as
  // they are.
  const inputs: Record<string, FormInputInterface> = { ...form.inputs }
  const newForm = { ...form, inputs }

  getFormInputsFromForm(newForm)
    // Nothing to fix on a hidden input: it is not validated at all
    .filter((e) => e.generatedValue !== true && !isFormInputHidden(e, form))
    .forEach((formInput) => {
      if (!formInput?.name) {
        return
      }

      const currentFormInput = {
        ...newForm.inputs[formInput.name],
        violations: [] as ViolationInterface[],
      }
      inputs[formInput.name] = currentFormInput

      if (currentFormInput.required && isEmptyValue(currentFormInput.value)) {
        currentFormInput.violations.push(
          createViolation({
            propertyPath: formInput.name,
            code: "required",
            message: translate("This field is required"),
          })
        )
        return
      }

      const value = currentFormInput.value
      if (typeof value === "number") {
        const { min, max } = currentFormInput
        if (typeof min === "number" && value < min) {
          currentFormInput.violations.push(
            createViolation({
              propertyPath: formInput.name,
              code: "min",
              message: translate(
                "This value should be greater than or equal to {{min}}",
                {
                  min,
                }
              ),
            })
          )
        }
        if (typeof max === "number" && value > max) {
          currentFormInput.violations.push(
            createViolation({
              propertyPath: formInput.name,
              code: "max",
              message: translate(
                "This value should be less than or equal to {{max}}",
                {
                  max,
                }
              ),
            })
          )
        }
      }

      if (currentFormInput?.validator) {
        try {
          currentFormInput.validator(currentFormInput.value, newForm.data)
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
              // An error may name the property it is about (a range blames its
              // end date, for instance).
              const { propertyPath } = error as Error & ViolationInterface
              currentFormInput.violations.push(
                createViolation({
                  ...(propertyPath ? { propertyPath } : {}),
                  message: error.message,
                })
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

  return newForm as FormBuiltInterface<Data>
}
