import { FormInterface } from "@/form/FormInterface"

export function formHasError(form: FormInterface): boolean {
  if (!form?.inputs) {
    return false
  }

  return Object.keys(form.inputs).some((key) => {
    if (form.inputs) {
      const formInput = form.inputs[key]
      return !!formInput.violations?.length
    }
  })
}
