import { InputControllerInterface } from "@/form/InputControllerInterface"
import { DefaultInputController } from "@/form/component/InputController/DefaultInputController"

export const WebsiteInputController = ({
  formInput,
  onChange,
}: InputControllerInterface) => {
  formInput.type = "url"
  return <DefaultInputController formInput={formInput} onChange={onChange} />
}
