import { FormInputInterface } from "@/form/FormInputInterface"
import { FormInterface } from "@/form/FormInterface"
import getFormInputInForm from "@/form/utils/getFormInputInForm"

export default function getFormInputsFromForm(
  form: FormInterface,
  withLogic: boolean = true
): FormInputInterface[] {
  if (!form?.inputs) return []
  const inputs = Object.keys(form.inputs)
    .map((key) => getFormInputInForm(form, key))
    .filter((e) => !!e)

  if (!withLogic) return inputs

  return inputs
    .filter((e) => {
      const groups = form.groups
      if (!groups) return true

      return e.groups && e.groups.some((group) => groups.includes(group))
    })
    .sort((a, b) => {
      // Les éléments avec order null ou undefined sont placés à la fin
      if (a.order == null && b.order == null) return 0
      if (a.order == null) return 1
      if (b.order == null) return -1

      return a.order - b.order
      // Tri numérique pour les valeurs d'order
    })
}
