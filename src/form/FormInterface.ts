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
  /**
   * Where fields without a group listed in itemGroups are rendered, in an
   * untitled section: before ("start") or after ("end", default) the groups.
   */
  ungroupedPosition?: "start" | "end"
}

/**
 * Inputs of a form, keyed by the fields of `Data` (a dotted path reaches a
 * nested field): an unknown name is reported when `Data` is given, any name is
 * accepted otherwise.
 */
export type FormInputsInterface<Data extends object = any> =
  string extends keyof Data
    ? Record<string, FormInputInterface>
    : { [K in keyof Data]?: FormInputInterface<Data[K]> } & {
        [K in `${keyof Data & string}.${string}`]?: FormInputInterface
      }

export interface FormInterface<Data extends object = any> {
  id?: string
  action?: ActionList
  name?: string
  /** Icon shown in the page-builder palette (FormArrayInputController). */
  icon?: FC
  error?: string
  loading?: boolean
  isBuilt?: boolean
  validator?: (data: Data) => Data | never
  inputs?: FormInputsInterface<Data>
  /**
   * Sends the data, usually to the API. May be sync or async: the form stays
   * loading until it settles. What it returns (or resolves to) replaces the
   * submitted data; returning nothing keeps the entered data.
   */
  onSubmit?: (data: Data) => Data | Promise<Data | void> | void
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

export type FormBuiltInterface<Data extends object = any> = Omit<
  Required<FormInterface<Data>>,
  "inputs"
> & {
  inputs: Record<string, FormInputInterface>
}
