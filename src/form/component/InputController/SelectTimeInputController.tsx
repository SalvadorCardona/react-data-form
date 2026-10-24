import { InputControllerInterface } from "@/form/InputControllerInterface"
import { SelectInputController } from "@/form/component/InputController/SelectInputController"
import { ValueOptionInterface } from "@/form/utils/valueOption"

const timeValueOptions: ValueOptionInterface[] = [
  // Minutes (converties en secondes)
  { label: "15 minutes", value: 60 * 15 },
  { label: "30 minutes", value: 60 * 30 },
  { label: "45 minutes", value: 60 * 45 },

  // Heures (converties en secondes)
  { label: "1 hour", value: 3600 },
  { label: "2 hours", value: 7200 },
  { label: "3 hours", value: 10800 },
  { label: "4 hours", value: 14400 },
  { label: "5 hours", value: 18000 },
  { label: "6 hours", value: 21600 },
  { label: "7 hours", value: 25200 },
  { label: "8 hours", value: 28800 },
  { label: "9 hours", value: 32400 },
  { label: "10 hours", value: 36000 },

  { label: "1 day", value: 86400 },
]

export const SelectTimeInputController = (props: InputControllerInterface) => {
  return (
    <SelectInputController
      {...props}
      formInput={{ ...props.formInput, valueOptions: timeValueOptions }}
    />
  )
}
