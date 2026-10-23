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
  /**
   * Declaration of the form, read once on mount — like `defaultValue` on an
   * uncontrolled input. Passing a different object on a later render has no
   * effect: to switch declaration, call `updateForm` from the returned context
   * (entered values are kept), or remount the component with a new `key`.
   */
  form: FormInterface<Data> | FormBuiltInterface<Data>
  onChange?: (data: Data, form: FormInterface<Data>) => void
  onSubmit?: (data: Data) => void
  // TODO : merge async Data and data
  asyncData?: () => Promise<Data>
  data?: Data
}

export interface FormContextOutput<Data extends object = any> {
  parentFormContext?: FormContextOutput<Data>
  updateData: (data: Partial<Data>, partial?: boolean) => void
  form: FormBuiltInterface<Data>
  onChange: (input: FormInputInterface) => void
  onSubmit: () => Promise<Data | undefined>
  ready: boolean
  updateForm: (form: FormBuiltInterface) => FormBuiltInterface
  onSuccess: Index<Data>
  isLoading: BooleanStateInterface
  /**
   * Validates the current values, shows the violations — sub-forms included —
   * and tells whether the form is valid.
   */
  validate: () => boolean
  /**
   * Registers the validation of a sub-form, run with the form's own on every
   * submission. Returns the function that unregisters it.
   */
  registerSubForm: (validate: () => boolean) => () => void
}

/**
 * Holds the state of a form: values, validation, submission.
 *
 * `form` is only read on the first render; see {@link UseFormParams.form}.
 */
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
  const subForms = useRef(new Set<() => boolean>())
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

  const validate = () => {
    const validatedForm = validateForm(currentForm)
    setCurrentForm(validatedForm)

    // Every sub-form runs, so that each one shows its own violations
    const subFormsValid = [...subForms.current]
      .map((validateSubForm) => validateSubForm())
      .every(Boolean)

    return !formHasError(validatedForm) && subFormsValid
  }

  const registerSubForm = (validateSubForm: () => boolean) => {
    subForms.current.add(validateSubForm)
    return () => {
      subForms.current.delete(validateSubForm)
    }
  }

  const handleSubmit = async () => {
    isLoading.setTrue()

    if (!validate()) {
      isLoading.setFalse()
      return
    }

    let submittedData = currentForm.data

    if (currentForm.onSubmit) {
      // form.onSubmit may be sync or async, and may return nothing
      submittedData = (await currentForm.onSubmit(submittedData)) ?? submittedData
    }

    await onSubmit?.(submittedData)

    isLoading.setFalse()

    onSuccess.publish(submittedData)

    return submittedData
  }

  const handleSubmitDebounced = useDebounceCallback(handleSubmit, DEBOUNCE_DELAY)

  const updateFormData = (newData: Partial<Data>, partial = true) => {
    const data = (partial ? { ...currentForm.data, ...newData } : newData) as Data
    const updatedForm = updateForm(currentForm, data, partial)
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
    validate,
    registerSubForm,
  }
}
