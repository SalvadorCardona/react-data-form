import { FormInterface } from "@/form/FormInterface"
import FormInputGroupProvider from "@/form/component/FormInputGroupProvider"
import { DefaultFormErrors } from "@/form/component/form/FormErrors"
import { DefaultFormSubmitAction } from "@/form/component/form/FormSubmitAction"
import { DefaultFormInputs } from "@/form/component/form/FormInputs"
import { deepMerge } from "@/internal/utils/object/deepMerge"

export interface FormConfigInterface {
  defaultForm: FormInterface
}

let config: FormConfigInterface = {
  defaultForm: {
    version: 1,
    errors: [],
    allowGeneratedValue: true,
    label: {
      success: "Donnée mise à jour",
      error: "Le formulaire est invalide",
    },
    inputs: {},
    components: {
      formGroupProvider: FormInputGroupProvider,
      formErrors: DefaultFormErrors,
      formSubmitAction: DefaultFormSubmitAction,
      formInputs: DefaultFormInputs,
    },
  },
}

export function getFormConfig(): FormConfigInterface {
  return config
}

export function setFormConfig(newConfig: FormConfigInterface): void {
  config = deepMerge(config, newConfig)
}
