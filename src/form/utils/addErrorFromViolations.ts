import { translate } from "react-mini-i18n"
import { FormBuiltInterface } from "@/form/FormInterface"
import { ApiJsonLdError } from "@/form/ApiJsonLdError"

/**
 * Key of the input a violation belongs to: the whole path when an input carries
 * it, otherwise its longest parent (`address.street` → `address`). Indexes are
 * read either way, `items[0].name` like `items.0.name`.
 */
function findInputKey(
  inputs: FormBuiltInterface["inputs"],
  propertyPath: string
): string | undefined {
  const parts = propertyPath.replace(/\[(\w*)\]/g, ".$1").split(".")

  for (let length = parts.length; length > 0; length--) {
    const key = parts.slice(0, length).join(".")
    if (inputs[key]) return key
  }

  return undefined
}

export function addErrorFromViolations<Data extends object = any>(
  form: FormBuiltInterface<Data>,
  apiError: ApiJsonLdError
): FormBuiltInterface<Data> {
  // Every input is copied: the inputs of the given form are left as they are.
  const inputs: FormBuiltInterface<Data>["inputs"] = { ...form.inputs }
  const newForm = { ...form, inputs }

  Object.keys(inputs).forEach((key) => {
    inputs[key] = { ...inputs[key], violations: [] }
  })

  // A new array on each call: errors never pile up, and the array inherited
  // from the default form is never mutated.
  newForm.errors = []

  if (!apiError?.violations) {
    return newForm
  }

  const violations = apiError?.violations ?? []

  violations.forEach((violation) => {
    const propertyPath = violation?.propertyPath
    const inputKey = propertyPath
      ? findInputKey(newForm.inputs, propertyPath)
      : undefined

    // No path, or a path no input matches: the error belongs to the form
    if (!inputKey) {
      newForm.errors.push(violation?.message ?? translate("Invalid value"))
      return
    }

    inputs[inputKey].violations!.push(violation)
  })

  return newForm
}
