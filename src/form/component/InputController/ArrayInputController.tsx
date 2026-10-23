import { Input } from "@/ui/input"
import { KeyboardEvent, useEffect, useState } from "react"
import { Badge } from "@/ui/badge"
import { InputControllerInterface } from "@/form/InputControllerInterface"
import { FormInputInterface } from "@/form/FormInputInterface"
import { CirclePlus, CircleX } from "lucide-react"
import { translate } from "react-mini-i18n"

export const ArrayInputController = ({
  formInput,
  onChange,
}: InputControllerInterface<FormInputInterface<string[]>>) => {
  const [currentValue, setCurrentValue] = useState("")
  const [values, setValues] = useState<string[]>((formInput.value as string[]) ?? [])
  const [error, setError] = useState(false)

  useEffect(() => {
    setValues((formInput.value as string[]) ?? [])
  }, [formInput.value])

  const change = (value: string[]) => {
    onChange({ ...formInput, ...{ value } })
    setValues(value)
  }

  const onKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return
    // Enter would otherwise submit the whole form (FormDecorator's hidden submit).
    event.preventDefault()
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

  if (formInput.readonly) {
    return (
      <div className={"flex"}>
        {values.map((e) => (
          <Badge variant="outline" className={"mr-1"} key={e}>
            {e}
          </Badge>
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className={"flex items-center"}>
        <Input
          type={formInput?.type ?? "text"}
          className={"mr-4"}
          value={currentValue}
          onKeyDown={onKeyPress}
          onChange={(e) => setCurrentValue(e.target.value)}
          placeholder={formInput.placeholder}
        />
        <button
          type="button"
          onClick={() => add(currentValue)}
          aria-label={translate("Add")}
        >
          <CirclePlus />
        </button>
      </div>
      {error && (
        <>
          <span>
            {translate("Minimum {{min}} characters", { min: formInput?.min })}
          </span>
        </>
      )}
      <div className={"flex mt-4"}>
        {values.map((e) => {
          return (
            <Badge variant="outline" className={"mr-1"} key={e}>
              <span className={"mr-2"}>{e}</span>
              <button
                type="button"
                onClick={remove(e)}
                aria-label={translate("Remove {{value}}", { value: e })}
              >
                <CircleX />
              </button>
            </Badge>
          )
        })}
      </div>
    </div>
  )
}
