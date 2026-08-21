import { InputControllerInterface } from "@/form/InputControllerInterface"
import { DefaultInputController } from "@/form/component/InputController/DefaultInputController"

export const PhoneInputController = ({
  formInput,
  onChange,
}: InputControllerInterface) => {
  formInput.type = "tel"
  return <DefaultInputController formInput={formInput} onChange={onChange} />
}
