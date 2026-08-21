import FormInputGroupProvider from "@/form/component/FormInputGroupProvider"
import { getInputControllerFromFormInput } from "@/form/utils/getInputControllerFromFormInput"
import { useEffect, useRef, useState } from "react"
import {
  BaseDecoratorFormInputInterface,
  FormInputInterface,
} from "@/form/FormInputInterface"
import { cn } from "@/ui/cn"
import useFormContext from "@/form/provider/useFormContext"
import { getFormConfig } from "@/form/FormConfig"
import { ValueOptionInterface } from "@/form/utils/valueOption"
import useDebounceCallback from "@/internal/hook/useDebounceCallback"
import { ActionList } from "@/internal/action/ActionList"

const BaseDecorator = (props: BaseDecoratorFormInputInterface) => {
  return <div className={props.className}>{props.children}</div>
}

export default function InputControllerProvider({
  formInput,
}: {
  formInput: FormInputInterface
}) {
  const formContext = useFormContext()
  const form = formContext.form
  const [valueOptions, setValueOptions] = useState<ValueOptionInterface[]>(
    formInput.valueOptions ?? []
  )

  const apiCallInProgressRef = useRef(false)
  const formInputRef = useRef(formInput)

  useEffect(() => {
    if (
      formInput.getValueOptions &&
      valueOptions.length === 0 &&
      !apiCallInProgressRef.current
    ) {
      apiCallInProgressRef.current = true

      formInput
        .getValueOptions()
        .then((options) => {
          setValueOptions(options)
        })
        .finally(() => {
          apiCallInProgressRef.current = false
        })
    }
  }, [formInput.getValueOptions])

  const debouncedSearch = useDebounceCallback(async (query: string, formContext) => {
    if (!formInputRef.current.onSearch) return
    const data = await formInputRef.current.onSearch(query, formContext)

    setValueOptions(data)

    return data
  }, 300)

  if (formInput.generatedValue && !formInput?.controller) {
    return <></>
  }

  if (form.action && formInput.actions && !formInput.actions.includes(form.action)) {
    return <></>
  }

  const CurrentFormGroupProvider =
    form?.components?.formGroupProvider ??
    getFormConfig()?.defaultForm?.components?.formGroupProvider ??
    FormInputGroupProvider

  const InputControllerComponent = getInputControllerFromFormInput(formInput)

  const className =
    formInput.type === "hidden" || (formInput?.hidden && formInput.hidden())
      ? "hidden"
      : ""

  const CurrentDecorator = formInput?.components?.decorator
    ? formInput.components.decorator
    : BaseDecorator

  const readonly: boolean | undefined =
    form.action === ActionList.read ? true : formInput.readonly

  const currentFormInput: FormInputInterface = {
    ...formInput,
    valueOptions,
    readonly,
  }

  currentFormInput.onSearch = async (
    query: string,
    formContext
  ): Promise<ValueOptionInterface[]> => {
    if (!formInput.onSearch) return []

    await debouncedSearch(query, formContext)

    return valueOptions
  }

  return (
    <CurrentDecorator
      formInput={currentFormInput}
      className={cn(formInput?.className, className)}
    >
      <CurrentFormGroupProvider
        formInput={currentFormInput}
        onChange={formContext.onChange}
        formInputComponent={InputControllerComponent}
      />
    </CurrentDecorator>
  )
}
