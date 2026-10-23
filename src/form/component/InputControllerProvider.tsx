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
import { useEffectCallback } from "@/internal/hook/useEffectCallback"

const sameItems = <T,>(a: T[] | undefined, b: T[] | undefined) =>
  a === b ||
  (!!a &&
    !!b &&
    a.length === b.length &&
    a.every((item, index) => item === b[index]))

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

  // The field stays mounted when the form changes, focus and local state
  // included. Only a new value brought by a new version of the form
  // (updateData, updateForm, async load) mounts it again: controllers may read
  // their value once, on mount. Its own changes keep the same version.
  const [mount, setMount] = useState({
    version: form.version,
    value: formInput.value,
    key: 0,
  })
  const versionChanged = form.version !== mount.version
  const valueChanged = !Object.is(formInput.value, mount.value)
  if (versionChanged || valueChanged) {
    setMount({
      version: form.version,
      value: formInput.value,
      key: versionChanged && valueChanged ? mount.key + 1 : mount.key,
    })
  }
  const [valueOptions, setValueOptions] = useState<ValueOptionInterface[]>(
    formInput.valueOptions ?? []
  )

  // The field stays mounted when the form is updated: options declared anew
  // replace the current ones.
  const [declaredValueOptions, setDeclaredValueOptions] = useState(
    formInput.valueOptions
  )
  if (!sameItems(formInput.valueOptions, declaredValueOptions)) {
    setDeclaredValueOptions(formInput.valueOptions)
    setValueOptions(formInput.valueOptions ?? [])
  }

  const apiCallInProgressRef = useRef(false)

  const fetchValueOptions = useEffectCallback(() => {
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
  })

  useEffect(() => {
    fetchValueOptions()
  }, [fetchValueOptions, formInput.getValueOptions])

  // useDebounceCallback runs the latest callback, hence the latest onSearch
  const debouncedSearch = useDebounceCallback(async (query: string, formContext) => {
    if (!formInput.onSearch) return
    const data = await formInput.onSearch(query, formContext)

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
      key={mount.key}
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
