import { use } from "react"
import { FormContextOutput } from "@/form/hook/useForm"
import { FormContext } from "@/form/provider/FormContext"

export default function useFormContext() {
  return use(FormContext) as Required<FormContextOutput>
}
