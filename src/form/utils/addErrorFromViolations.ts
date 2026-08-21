import { FormBuiltInterface } from "@/form/FormInterface"
import { ApiJsonLdError } from "@/form/ApiJsonLdError"

export function addErrorFromViolations(
  form: FormBuiltInterface,
  apiError: ApiJsonLdError
): FormBuiltInterface {
  const newForm = { ...form }

  Object.keys(newForm.inputs).map((key) => {
    const currentFormInput = newForm.inputs[key]
    currentFormInput.violations = []
  })

  if (!apiError?.violations) {
    return newForm
  }

  const violations = apiError?.violations ?? []

  violations.forEach((violation) => {
    const propertyPath = violation?.propertyPath

    if (!newForm.inputs || !propertyPath) return

    const formInput = newForm.inputs[propertyPath]
    if (formInput) {
      if (!formInput?.violations) formInput.violations = []

      formInput.violations.push(violation)
    }
    if (violation.propertyPath === "") {
      if (!newForm.errors) newForm.errors = []

      newForm.errors.push(violation?.message ?? "Non valide")
    }
  })

  return newForm
}
