import { createContext, use } from "react"

/**
 * ARIA attributes the field group (FormInputGroupProvider) computes for the
 * control it wraps: invalid state, ids of the error and description messages,
 * required flag. Controllers spread them next to `formInput.id` on their main
 * interactive element; outside a group they are empty.
 */
export interface FieldControlAriaInterface {
  "aria-invalid"?: true
  "aria-describedby"?: string
  "aria-required"?: true
}

export const FieldControlContext = createContext<FieldControlAriaInterface>({})

export const useFieldControlAria = () => use(FieldControlContext)

export const getFieldDescriptionId = (inputId: string) => `${inputId}-description`

export const getFieldErrorId = (inputId: string, index: number) =>
  `${inputId}-error-${index}`
