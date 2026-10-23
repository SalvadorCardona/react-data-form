import { ValueOptionInterface } from "@/form/utils/valueOption"
import { InputControllerComponentInterface } from "@/form/InputControllerInterface"
import { FormBuiltInterface, FormInterface } from "@/form/FormInterface"
import { FC, PropsWithChildren, ReactNode } from "react"
import { FormContextInterface } from "@/form/provider/FormContext"
import ViolationInterface from "@/form/Violation"

export interface BaseDecoratorFormInputInterface extends PropsWithChildren {
  formInput: FormInputInterface
  className?: string
}

export interface FormInputInterface<Value = any, Data extends object = any> {
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
  /**
   * Throws to report the value as invalid; what it returns is ignored. `data`
   * holds the whole form data, for rules spanning several keys.
   */
  validator?: (value: Value, data?: any) => Value | void
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
  /**
   * Hides the input given the current data of the form, « company » only for a
   * professional customer for instance. A hidden input is not validated and,
   * unless `keepHiddenValue`, its value is left out of the submitted data.
   */
  hidden?: (data: Data, form: FormBuiltInterface<Data>) => boolean
  /**
   * Submits the value of the input even while `hidden` hides it (default
   * `false`). An input of type "hidden" is always submitted.
   */
  keepHiddenValue?: boolean
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
