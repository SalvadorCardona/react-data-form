import { InputControllerInterface } from "@/form/InputControllerInterface"
import { DefaultInputController } from "@/form/component/InputController/DefaultInputController"

export const EmailInputController = ({
  formInput,
  onChange,
}: InputControllerInterface) => {
  formInput.type = "email"
  return <DefaultInputController formInput={formInput} onChange={onChange} />
}
