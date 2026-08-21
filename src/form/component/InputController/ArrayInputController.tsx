import { Input } from "@/ui/input"
import { KeyboardEvent, useState } from "react"
import { Badge } from "@/ui/badge"
import { InputControllerInterface } from "@/form/InputControllerInterface"
import { FormInputInterface } from "@/form/FormInputInterface"
import { CirclePlus, CircleX } from "lucide-react"

export const ArrayInputController = ({
  formInput,
  onChange,
}: InputControllerInterface<FormInputInterface<string[]>>) => {
  const [currentValue, setCurrentValue] = useState("")
  const [values, setValues] = useState<string[]>((formInput.value as string[]) ?? [])
  const [error, setError] = useState(false)

  const change = (value: string[]) => {
    onChange({ ...formInput, ...{ value } })
    setValues(value)
  }

  const onKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return
    add(currentValue)
  }

  const remove = (value: string) => () => {
    const newValues = values.filter((e) => e !== value)
    change(newValues)
  }

  const add = (value: string) => {
    if (!value) return
    if (values.includes(value)) return
    const newValues = [...values, value]
    if (formInput?.min && formInput.min > value.length) {
      setError(true)
      return
    }
    change(newValues)
    setCurrentValue("")
    setError(false)
  }

  return (
    <div>
      <div className={"flex items-center"}>
        <Input
          type={formInput?.type ?? "text"}
          className={"mr-4"}
          defaultValue={currentValue}
          onKeyDown={onKeyPress}
          onChange={(e) => setCurrentValue(e.target.value)}
          placeholder={formInput.placeholder}
        />
        <CirclePlus onClick={() => add(currentValue)} />
      </div>
      {error && (
        <>
          <span>Minimum {formInput?.min} characters</span>
        </>
      )}
      <div className={"flex mt-4"}>
        {values.map((e) => {
          return (
            <Badge variant="outline" className={"mr-1"} key={e}>
              <span className={"mr-2"}>{e}</span>
              <CircleX onClick={remove(e)} />
            </Badge>
          )
        })}
      </div>
    </div>
  )
}
