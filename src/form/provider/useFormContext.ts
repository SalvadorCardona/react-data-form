import { use } from "react"
import { FormContextOutput } from "@/form/hook/useForm"
import { FormContext } from "@/form/provider/FormContext"

export default function useFormContext() {
  const formContext = use(FormContext)
  if (!formContext.form) {
    throw new Error("useFormContext must be used inside a FormProvider")
  }
  return formContext as Required<FormContextOutput>
}
