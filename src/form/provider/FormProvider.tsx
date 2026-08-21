import { PropsWithChildren } from "react"
import {
  FormContext,
  FormContextInterface,
} from "@/form/provider/FormContext"

export interface FormProviderPropsInterface extends PropsWithChildren {
  formContext: FormContextInterface
}

export default function FormProvider({
  formContext,
  children,
}: FormProviderPropsInterface) {
  return (
    <FormContext
      key={"form" + formContext.form.id + formContext.form.version}
      value={formContext}
    >
      {children}
    </FormContext>
  )
}
