import { use, useEffect, useMemo, useRef, useState } from "react"
import { FormBuiltInterface, FormInterface } from "@/form/FormInterface"
import { FormInputInterface } from "@/form/FormInputInterface"
import { createForm } from "@/form/utils/createForm"
import { validateForm } from "@/form/utils/validateForm"
import { formHasError } from "@/form/utils/formHasError"
import { updateFormByFormInput } from "@/form/utils/updateFormByFormInput"
import { updateForm } from "@/form/utils/updateForm"
import useDebounceCallback from "@/internal/hook/useDebounceCallback"
import { BooleanStateInterface, useBoolean } from "@/internal/hook/useBoolean"
import { useEffectCallback } from "@/internal/hook/useEffectCallback"
import { FormContext } from "@/form/provider/FormContext"
import { createPubSub, Index } from "coooking-pubsub"
import { translate } from "react-mini-i18n"

export interface UseFormParams<Data extends object = any> {
  /**
   * Declaration of the form, read once on mount — like `defaultValue` on an
   * uncontrolled input. Passing a different object on a later render has no
   * effect: to switch declaration, call `updateForm` from the returned context
   * (entered values are kept), or remount the component with a new `key`.
   */
  form: FormInterface<Data> | FormBuiltInterface<Data>
  onChange?: (data: Data, form: FormBuiltInterface<Data>) => void
  onSubmit?: (data: Data) => void
  // TODO : merge async Data and data
  asyncData?: () => Promise<Data>
  /**
   * Called when `asyncData` (or `form.getData`) rejects. The form stops
   * loading and shows a form error either way.
   */
  onLoadError?: (error: unknown) => void
  data?: Data
}

export interface FormContextOutput<Data extends object = any> {
  parentFormContext?: FormContextOutput<Data>
  updateData: (data: Partial<Data>, partial?: boolean) => void
  form: FormBuiltInterface<Data>
  onChange: (input: FormInputInterface) => void
  onSubmit: () => Promise<Data | undefined>
  ready: boolean
  /**
   * The reason `asyncData` (or `form.getData`) rejected, if it did.
   */
  loadError?: unknown
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
  onLoadError,
}: UseFormParams<Data>): FormContextOutput<Data> {
  // Extraire les constantes
  const DEBOUNCE_DELAY = 1500
  const isLoading = useBoolean(false)
  const [onSuccess] = useState(createPubSub())
  const isFetching = useRef(false)
  // A root form has no parent: the context is then empty.
  const parentContext = use(FormContext)
  const parentFormContext = parentContext.form
    ? (parentContext as FormContextOutput<Data>)
    : undefined
  const subForms = useRef(new Set<() => boolean>())
  const [isReady, setIsReady] = useState<boolean>(false)
  const [loadError, setLoadError] = useState<unknown>()
  const [currentForm, setCurrentForm] = useState<FormBuiltInterface<Data>>(
    form.isBuilt
      ? (form as FormBuiltInterface<Data>)
      : createForm(form, data ?? ({} as Data))
  )
  // The latest state, ahead of the render: several changes in the same tick
  // (a date range sends both of its bounds) each build on the previous one,
  // without mutating the state already rendered.
  const latestForm = useRef(currentForm)

  const commitForm = (nextForm: FormBuiltInterface<Data>) => {
    latestForm.current = nextForm
    setCurrentForm(nextForm)
    return nextForm
  }

  const handleChange = (formInput: FormInputInterface) => {
    if (formInput.readonly) return

    const updatedForm = commitForm(
      updateFormByFormInput<Data>(latestForm.current, formInput)
    )

    onChange?.(updatedForm.data, updatedForm)
    if (updatedForm?.saveOnChange) {
      handleSubmitDebounced()
    }
  }

  const validate = () => {
    const validatedForm = commitForm(validateForm(latestForm.current))

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

    const { data: validatedData, onSubmit: formOnSubmit } = latestForm.current
    let submittedData = validatedData

    if (formOnSubmit) {
      // form.onSubmit may be sync or async, and may return nothing
      submittedData = (await formOnSubmit(submittedData)) ?? submittedData
    }

    await onSubmit?.(submittedData)

    isLoading.setFalse()

    onSuccess.publish(submittedData)

    return submittedData
  }

  const handleSubmitDebounced = useDebounceCallback(handleSubmit, DEBOUNCE_DELAY)

  const updateFormData = (newData: Partial<Data>, partial = true) => {
    const data = (
      partial ? { ...latestForm.current.data, ...newData } : newData
    ) as Data
    const updatedForm = commitForm(updateForm(latestForm.current, data, partial))
    onChange?.(updatedForm.data, updatedForm)
  }

  // Effets
  const loadData = useEffectCallback(() => {
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

    dataLoader()
      .then((data) => {
        updateFormData({ ...latestForm.current.data, ...data }, false)
      })
      .catch((error: unknown) => {
        setLoadError(error)
        commitForm({
          ...latestForm.current,
          errors: [translate("Unable to load the data")],
        })
        onLoadError?.(error)
      })
      .finally(() => {
        isFetching.current = false
        setIsReady(true)
      })
  })

  useEffect(() => {
    loadData()
  }, [loadData, currentForm.id])

  const updateFormHandler = (newForm: FormInterface): FormBuiltInterface => {
    const data = { ...latestForm.current.data, ...newForm.data }
    const updatedForm = commitForm(updateForm(newForm as FormBuiltInterface, data))

    onChange?.(updatedForm.data, updatedForm)

    return updatedForm
  }

  const renderedForm = useMemo(
    () =>
      currentForm.loading === isLoading.value
        ? currentForm
        : { ...currentForm, loading: isLoading.value },
    [currentForm, isLoading.value]
  )

  return {
    isLoading,
    parentFormContext,
    onSuccess: onSuccess,
    updateForm: updateFormHandler,
    ready: isReady,
    loadError,
    onChange: handleChange,
    onSubmit: handleSubmit,
    form: renderedForm,
    updateData: updateFormData,
    validate,
    registerSubForm,
  }
}
