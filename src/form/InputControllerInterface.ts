import { FormInputInterface } from "@/form/FormInputInterface"
import { FC } from "react"

export interface InputControllerInterface<
  F extends FormInputInterface = FormInputInterface,
> {
  formInput: F
  onChange: (formInput: F) => void
}

export type InputControllerComponentInterface = FC<InputControllerInterface>

// export const DatePickerInputController = ({
//  formInput,
//  onChange,
//  }: InputControllerProps<string | null | undefined>) => {
//
// }
export type InputControllerProps<T = unknown> = InputControllerInterface<
  FormInputInterface<T | undefined>
>
