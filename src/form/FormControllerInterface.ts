import { FC } from "react"
import { FormInterface } from "@/form/FormInterface"

export interface FormControllerInterface<F = FormInterface> {
  form: F
  onChange: (form: F) => void
}

export type FormControllerComponentInterface = FC<FormControllerInterface>
