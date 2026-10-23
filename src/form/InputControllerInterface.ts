import { FormInputInterface } from "@/form/FormInputInterface"
import { FC } from "react"

export interface InputControllerInterface<
  F extends FormInputInterface = FormInputInterface,
> {
  formInput: F
  onChange: (formInput: F) => void
}

// `any` lets a controller typed on its own input interface
// (`FC<InputControllerInterface<MyFormInput>>`) be used without a cast.
export type InputControllerComponentInterface = FC<InputControllerInterface<any>>

// export const DatePickerInputController = ({
//  formInput,
//  onChange,
//  }: InputControllerProps<string | null | undefined>) => {
//
// }
export type InputControllerProps<T = unknown> = InputControllerInterface<
  FormInputInterface<T | undefined>
>
