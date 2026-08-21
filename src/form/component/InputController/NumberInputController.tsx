import { InputControllerInterface } from "@/form/InputControllerInterface"
import { DefaultInputController } from "@/form/component/InputController/DefaultInputController"

export const NumberInputController = ({
  formInput,
  onChange,
}: InputControllerInterface) => {
  formInput.type = "number"
  return <DefaultInputController formInput={formInput} onChange={onChange} />
}
