import { createContext } from "react"
import { FormContextOutput } from "@/form/hook/useForm"

export interface FormContextInterface extends FormContextOutput {
  formContextParent?: FormContextInterface
}

export const FormContext = createContext<Partial<FormContextInterface>>({})
