import { useEffect, useRef, useState } from "react"
import { FormBuiltInterface, FormInterface } from "@/form/FormInterface"
import { FormInputInterface } from "@/form/FormInputInterface"
import { createForm } from "@/form/utils/createForm"
import { validateForm } from "@/form/utils/validateForm"
import { formHasError } from "@/form/utils/formHasError"
import { updateFormByFormInput } from "@/form/utils/updateFormByFormInput"
import { updateForm } from "@/form/utils/updateForm"
import useDebounceCallback from "@/internal/hook/useDebounceCallback"
import { BooleanStateInterface, useBoolean } from "@/internal/hook/useBoolean"
import useFormContext from "@/form/provider/useFormContext"
import { createPubSub, Index } from "coooking-pubsub"

export interface UseFormParams<Data extends object = any> {
  form: FormInterface<Data> | FormBuiltInterface<Data>
  onChange?: (data: Data, form: FormInterface<Data>) => void
  onSubmit?: (data: Data) => void
  // TODO : merge async Data and data
  asyncData?: () => Promise<Data>
  data?: Data
}

export interface FormContextOutput<Data extends object = any> {
  parentFormContext?: FormContextOutput<Data>
  updateData: (data: Data, partial?: boolean) => void
  form: FormBuiltInterface<Data>
  onChange: (input: FormInputInterface) => void
  onSubmit: () => Promise<Data | undefined>
  ready: boolean
  updateForm: (form: FormBuiltInterface) => FormBuiltInterface
  onSuccess: Index<Data>
  isLoading: BooleanStateInterface
}

export default function useForm<Data extends object = object>({
  form,
  data,
  onChange,
  onSubmit,
  asyncData,
}: UseFormParams<Data>): FormContextOutput<Data> {
  // Extraire les constantes
  const DEBOUNCE_DELAY = 1500
  const isLoading = useBoolean(false)
  const [onSuccess] = useState(createPubSub())
  const isFetching = useRef(false)
  const parentFormContext = useFormContext()
  const [isReady, setIsReady] = useState<boolean>(false)
  const [currentForm, setCurrentForm] = useState<FormBuiltInterface<Data>>(
    form.isBuilt
      ? (form as FormBuiltInterface<Data>)
      : createForm(form, data ?? ({} as Data))
  )

  const handleChange = (formInput: FormInputInterface) => {
    if (formInput.readonly) return

    const updatedForm = updateFormByFormInput<Data>(currentForm, formInput)
    setCurrentForm({ ...currentForm, ...updatedForm })

    onChange?.(currentForm.data, updatedForm)
    if (updatedForm?.saveOnChange) {
      handleSubmitDebounced()
    }
  }

  const handleSubmit = async () => {
    isLoading.setTrue()

    const validatedForm = validateForm(currentForm)
    setCurrentForm(validatedForm)

    if (formHasError(validatedForm)) {
      isLoading.setFalse()
      return
    }

    let submittedData = currentForm.data

    if (currentForm.onSubmit) {
      submittedData = currentForm.onSubmit(submittedData)
    }

    await onSubmit?.(submittedData)

    isLoading.setFalse()

    onSuccess.publish(submittedData)

    return submittedData
  }

  const handleSubmitDebounced = useDebounceCallback(handleSubmit, DEBOUNCE_DELAY)

  const updateFormData = (newData: Data, partial = true) => {
    const updatedForm = updateForm(currentForm, newData, partial)
    setCurrentForm(updatedForm)
    onChange?.(updatedForm.data, updatedForm)
  }

  // Effets
  useEffect(() => {
    if (isReady) return

    const dataLoader = asyncData ?? form.getData

    if (!dataLoader) {
      setIsReady(true)
      return
    }

    if (isFetching.current) {
      return
    }

    isFetching.current = true

    dataLoader().then((data) => {
      updateFormData({ ...currentForm.data, ...data }, false)
      isFetching.current = false
      setIsReady(true)
    })
  }, [currentForm.id])

  const updateFormHandler = (newForm: FormInterface): FormBuiltInterface => {
    const data = { ...currentForm.data, ...newForm.data }
    const updatedForm = updateForm(newForm as FormBuiltInterface, data)

    setCurrentForm(updatedForm)

    onChange?.(updatedForm.data, updatedForm)

    return updatedForm
  }

  currentForm.loading = isLoading.value

  return {
    isLoading,
    parentFormContext,
    onSuccess: onSuccess,
    updateForm: updateFormHandler,
    ready: isReady,
    onChange: handleChange,
    onSubmit: handleSubmit,
    form: currentForm,
    updateData: updateFormData,
  }
}
