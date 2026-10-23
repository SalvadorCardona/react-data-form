import { FormInterface } from "@/form/FormInterface"
import FormInputGroupProvider from "@/form/component/FormInputGroupProvider"
import { DefaultFormErrors } from "@/form/component/form/FormErrors"
import { DefaultFormSubmitAction } from "@/form/component/form/FormSubmitAction"
import { DefaultFormInputs } from "@/form/component/form/FormInputs"
import { deepMerge } from "@/internal/utils/object/deepMerge"
import { ApiJsonLdError } from "@/form/ApiJsonLdError"

/**
 * Reads the violations out of whatever a rejected `onSubmit` threw. Returns
 * `undefined` when the error carries none: it is then left to `onError`.
 */
export type ExtractViolations = (error: unknown) => ApiJsonLdError | undefined

/**
 * Default {@link ExtractViolations}: the error itself, when it has the shape of
 * an API Platform `problem+json` body (a `violations` array).
 */
export const extractApiJsonLdViolations: ExtractViolations = (error) =>
  Array.isArray((error as ApiJsonLdError | undefined)?.violations)
    ? (error as ApiJsonLdError)
    : undefined

export interface FormConfigInterface {
  defaultForm: FormInterface
  extractViolations: ExtractViolations
}

let config: FormConfigInterface = {
  defaultForm: {
    version: 1,
    errors: [],
    allowGeneratedValue: true,
    showSuccess: true,
    label: {
      success: "Saved",
      error: "The form is invalid",
    },
    inputs: {},
    components: {
      formGroupProvider: FormInputGroupProvider,
      formErrors: DefaultFormErrors,
      formSubmitAction: DefaultFormSubmitAction,
      formInputs: DefaultFormInputs,
    },
  },
  extractViolations: extractApiJsonLdViolations,
}

export function getFormConfig(): FormConfigInterface {
  return config
}

export function setFormConfig(newConfig: Partial<FormConfigInterface>): void {
  config = deepMerge(config, newConfig as FormConfigInterface)
}
