import { FC } from "react"
import { DefaultInputController } from "@/form/component/InputController/DefaultInputController"
import { InputControllerInterface } from "@/form/InputControllerInterface"
import { FormInputInterface } from "@/form/FormInputInterface"
import { FormInputController } from "@/form/component/InputController/FormInputController"

export function getInputControllerFromFormInput(
  formInput: FormInputInterface
): FC<InputControllerInterface> {
  if (formInput.controller)
    return formInput.controller as FC<InputControllerInterface>

  if (formInput.form) {
    return FormInputController
  }

  return DefaultInputController
}
