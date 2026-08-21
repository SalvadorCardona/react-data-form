import { InputControllerInterface } from "@/form/InputControllerInterface"
import { SelectInputController } from "@/form/component/InputController/SelectInputController"
import { ValueOptionInterface } from "@/form/utils/valueOption"

const timeValueOptions: ValueOptionInterface[] = [
  // Minutes (converties en secondes)
  { label: "15 minutes", value: 60 * 15 },
  { label: "30 minutes", value: 60 * 30 },
  { label: "45 minutes", value: 60 * 45 },

  // Heures (converties en secondes)
  { label: "1 heure", value: 3600 },
  { label: "2 heures", value: 7200 },
  { label: "3 heures", value: 10800 },
  { label: "4 heures", value: 14400 },
  { label: "5 heures", value: 18000 },
  { label: "6 heures", value: 21600 },
  { label: "7 heures", value: 25200 },
  { label: "8 heures", value: 28800 },
  { label: "9 heures", value: 32400 },
  { label: "10 heures", value: 36000 },

  { label: "1 jour", value: 86400 },
]

export const SelectTimeInputController = (props: InputControllerInterface) => {
  props.formInput.valueOptions = timeValueOptions

  return <SelectInputController {...props} />
}
