import { FormBuiltInterface, FormInterfaceValueType } from "@/form/FormInterface"
import getFormInputsFromForm from "@/form/utils/getFormInputsFromForm"
import ViolationInterface, { createViolation, isZodError } from "@/form/Violation"
import { FormInputInterface } from "@/form/FormInputInterface"
import { translate } from "react-mini-i18n"

// false and 0 are answers, not missing values
function isEmptyValue(value: unknown): boolean {
  return (
    value === undefined ||
    value === null ||
    value === "" ||
    (Array.isArray(value) && value.length === 0)
  )
}

function isHiddenInput(formInput: FormInputInterface): boolean {
  return formInput.type === "hidden" || formInput.hidden?.() === true
}

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

      if (
        currentFormInput.required &&
        !isHiddenInput(currentFormInput) &&
        isEmptyValue(currentFormInput.value)
      ) {
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

  return newForm
}
