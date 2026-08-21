import { ValueOptionInterface } from "@/form/utils/valueOption"
import { InputControllerComponentInterface } from "@/form/InputControllerInterface"
import { FormInterface } from "@/form/FormInterface"
import { FC, PropsWithChildren, ReactNode } from "react"
import { FormContextInterface } from "@/form/provider/FormContext"
import ViolationInterface from "@/form/Violation"

export interface BaseDecoratorFormInputInterface extends PropsWithChildren {
  formInput: FormInputInterface
  className?: string
}

export interface FormInputInterface<Value = any> {
  id?: string
  groups?: string[]
  name?: string
  label?: string | null | ReactNode
  description?: string | ReactNode
  placeholder?: string
  // Todo : merge default getDefaultValue and value Option and the same property
  getValueOptions?: (
    formInput?: FormInputInterface<Value>
  ) => Promise<ValueOptionInterface[]>
  valueOptions?: ValueOptionInterface[]
  onSearch?: (
    query: string,
    formContext?: FormContextInterface
  ) => Promise<ValueOptionInterface[]>
  className?: string
  violations?: ViolationInterface[]
  validator?: (value: Value) => Value | never
  type?: string | "hidden"
  // Todo : merge default value to default Value in the same property
  defaultValue?: Value | ((value: Value | any) => any)
  value?: Value
  readonly?: boolean
  required?: boolean
  autocomplete?: string
  controller?: InputControllerComponentInterface
  min?: number
  max?: number
  hidden?: () => boolean
  generatedValue?: boolean
  form?: FormInterface
  for?: string
  components?: {
    decorator?: FC<BaseDecoratorFormInputInterface>
  }
  actions?: FormInterface["action"][]
  order?: number
  getForm?: () => FormInterface
}
