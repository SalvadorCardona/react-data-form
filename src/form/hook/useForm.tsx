import { use, useEffect, useMemo, useRef, useState } from "react"
import { FormBuiltInterface, FormInterface } from "@/form/FormInterface"
import { FormInputInterface } from "@/form/FormInputInterface"
import { createForm } from "@/form/utils/createForm"
import { validateForm } from "@/form/utils/validateForm"
import { formHasError } from "@/form/utils/formHasError"
import { updateFormByFormInput } from "@/form/utils/updateFormByFormInput"
import { updateForm } from "@/form/utils/updateForm"
import { upsertForm } from "@/form/utils/upsertForm"
import { getDataFromForm } from "@/form/utils/getDataFromForm"
import { addErrorFromViolations } from "@/form/utils/addErrorFromViolations"
import { getFormConfig } from "@/form/FormConfig"
import { isDeepEqual } from "@/internal/utils/object/isDeepEqual"
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
  onSubmit?: (data: Data) => void | Promise<void>
  /**
   * Called when the submission rejects — `form.onSubmit` or `onSubmit` — with
   * the error as thrown and the form as displayed. Violations found by
   * `extractViolations` (see `setFormConfig`) are already under their fields.
   */
  onError?: (error: unknown, form: FormBuiltInterface<Data>) => void
  // TODO : merge async Data and data
  asyncData?: () => Promise<Data>
  /**
   * Called when `asyncData` (or `form.getData`) rejects. The form stops
   * loading and shows a form error either way.
   */
  onLoadError?: (error: unknown) => void
  data?: Data
  /**
   * Asks the browser to confirm before leaving the page (`beforeunload`)
   * while the form has unsaved changes, see {@link FormContextOutput.isDirty}.
   */
  warnOnLeave?: boolean
}

/**
 * Outcome of the last submission: its validation failed ("error") or the data
 * was sent ("success").
 */
export interface FormSubmitResultInterface {
  status: "success" | "error"
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
  /**
   * Outcome of the last submission, a new object on each one. Cleared when a
   * new submission starts; a success is also cleared when a value changes.
   */
  submitResult?: FormSubmitResultInterface
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
  /**
   * Whether the values differ — deep comparison — from the ones the form was
   * built or loaded with, or last submitted successfully.
   */
  isDirty: boolean
  /**
   * Puts those values back and clears the violations: `isDirty` is false again.
   * `originalData` is left as it is.
   */
  reset: () => void
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
  onError,
  asyncData,
  onLoadError,
  warnOnLeave = false,
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
  // The form errors set by the last failed submission, cleared by the next one
  const submitErrors = useRef<string[]>(undefined)
  const [isReady, setIsReady] = useState<boolean>(false)
  const [loadError, setLoadError] = useState<unknown>()
  const [submitResult, setSubmitResult] = useState<FormSubmitResultInterface>()
  const [currentForm, setCurrentForm] = useState<FormBuiltInterface<Data>>(
    form.isBuilt
      ? (form as FormBuiltInterface<Data>)
      : createForm(form, data ?? ({} as Data))
  )
  // The latest state, ahead of the render: several changes in the same tick
  // (a date range sends both of its bounds) each build on the previous one,
  // without mutating the state already rendered.
  const latestForm = useRef(currentForm)
  // The values of originalData as the form shows them, defaults included:
  // what isDirty compares against and reset() goes back to.
  const [pristineData, setPristineData] = useState<Data>(currentForm.data)

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

    // "Saved" no longer describes the values once one of them changes
    setSubmitResult((result) => (result?.status === "success" ? undefined : result))

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
    setSubmitResult(undefined)

    if (!validate()) {
      isLoading.setFalse()
      setSubmitResult({ status: "error" })
      return
    }

    if (latestForm.current.errors === submitErrors.current) {
      commitForm({ ...latestForm.current, errors: [] })
    }

    const { onSubmit: formOnSubmit } = latestForm.current
    // Values typed while the submission runs are not the ones saved
    const savedData = latestForm.current.data
    let submittedData = getDataFromForm(latestForm.current, {
      withoutHiddenValues: true,
    })

    try {
      if (formOnSubmit) {
        // form.onSubmit may be sync or async, and may return nothing
        submittedData = (await formOnSubmit(submittedData)) ?? submittedData
      }

      await onSubmit?.(submittedData)
    } catch (error) {
      const apiError = getFormConfig().extractViolations(error)
      const failedForm = apiError
        ? commitForm(addErrorFromViolations(latestForm.current, apiError))
        : latestForm.current
      submitErrors.current = apiError ? failedForm.errors : undefined

      isLoading.setFalse()
      onError?.(error, failedForm)

      // Nobody to tell: the error is not swallowed
      if (!apiError && !onError) throw error
      return
    }

    // The record is now the one saved: its id (an `@id` returned by the API
    // after a creation) is kept for the next submission.
    commitForm({
      ...latestForm.current,
      originalData: { ...latestForm.current.originalData, ...submittedData },
    })
    setPristineData(savedData)

    isLoading.setFalse()
    setSubmitResult({ status: "success" })

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
        setPristineData(latestForm.current.data)
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

  const reset = () => {
    const resetForm = upsertForm(latestForm.current, pristineData, {
      partial: false,
      keepOriginalData: true,
    })
    const updatedForm = commitForm({
      ...resetForm,
      errors: [],
      inputs: Object.fromEntries(
        Object.entries(resetForm.inputs).map(([key, input]) => [
          key,
          { ...input, violations: [] },
        ])
      ),
    })
    submitErrors.current = undefined
    setSubmitResult(undefined)

    onChange?.(updatedForm.data, updatedForm)
  }

  const isDirty = useMemo(
    () => !isDeepEqual(currentForm.data, pristineData),
    [currentForm.data, pristineData]
  )

  useEffect(() => {
    if (!warnOnLeave || !isDirty) return

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      // Still required by some browsers to show the prompt
      event.returnValue = ""
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [warnOnLeave, isDirty])

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
    submitResult,
    onChange: handleChange,
    onSubmit: handleSubmit,
    form: renderedForm,
    updateData: updateFormData,
    validate,
    registerSubForm,
    isDirty,
    reset,
  }
}
