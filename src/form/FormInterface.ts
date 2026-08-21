import { FormInputInterface } from "@/form/FormInputInterface"
import { FC } from "react"
import { FormGroupProviderPropsInterface } from "@/form/component/FormInputGroupProvider"
import { FormControllerComponentInterface } from "@/form/FormControllerInterface"
import { FormDecoratorPropsInterface } from "@/form/component/form/FormDecorator"
import { ActionList } from "@/internal/action/ActionList"

export type FormInterfaceValueType = Record<string, any>

export interface ItemGroupOption {
  name?: string
  group: string
  title?: string
  description?: string
  order: number
  icon?: FC
  collapsible?: boolean
  component?: {
    submitButton?: FC
  }
}

export interface GroupOption {
  itemGroups: ItemGroupOption[]
}

export interface FormInterface<Data extends object = any> {
  id?: string
  action?: ActionList
  name?: string
  /** Icône affichée dans la palette du page builder (FormArrayInputController). */
  icon?: FC
  error?: string
  loading?: boolean
  isBuilt?: boolean
  validator?: (data: Data) => Data | never
  inputs?: Record<
    keyof Data | string,
    FormInputInterface<Data[keyof Data] | unknown>
  >
  onSubmit?: (data: Data) => Data
  className?: string
  saveOnChange?: boolean
  errors?: string[]
  allowGeneratedValue?: boolean
  version?: number
  label?: {
    title?: string
    description?: string
    submit?: string
    success?: string
    error?: string
  }
  components?: {
    formSubmitAction?: FC
    formErrors?: FC
    formGroupProvider?: FC<FormGroupProviderPropsInterface>
    formDecorator?: FC<FormDecoratorPropsInterface>
    formInputs?: FC
  }
  data?: Data
  getData?: () => Promise<Data>
  originalData?: Data
  controller?: FormControllerComponentInterface
  groups?: string[]
  groupOption?: GroupOption
}

export type FormBuiltInterface<Data extends object = any> = Required<
  FormInterface<Data>
>
