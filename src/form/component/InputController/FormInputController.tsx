import { InputControllerInterface } from "@/form/InputControllerInterface"
import { FormInputInterface } from "@/form/FormInputInterface"
import { FormInterface } from "@/form/FormInterface"
import useForm from "@/form/hook/useForm"
import FormElement from "@/form/component/form/FormElement"
import { PropsWithChildren, useEffect, useRef } from "react"
import useFormContext from "@/form/provider/useFormContext"
import { isFormInputHidden } from "@/form/utils/isFormInputHidden"
import { useEffectCallback } from "@/internal/hook/useEffectCallback"

interface FormInputControllerPropsInterface
  extends
    InputControllerInterface<FormInputInterface<FormInterface>>,
    PropsWithChildren {
  /** Shows the violations of the sub-form as soon as it mounts. */
  validateOnMount?: boolean
}

export const FormInputController = ({
  formInput,
  onChange,
  children,
  validateOnMount,
}: FormInputControllerPropsInterface) => {
  const formContext = useFormContext()
  const baseForm: FormInterface = {
    saveOnChange: true,
    action: formContext.form.action,
  }

  const currentForm: FormInterface = {
    ...baseForm,
    ...formInput?.form,
  }

  const form = useForm({
    form: currentForm ?? {},
    data: formInput.value,
    onChange: (data) => {
      onChange({ ...formInput, value: data })
    },
  })

  // The parent submission runs the latest validation of the sub-form, skipped
  // for a hidden input, like the parent's own hidden inputs
  const validateRef = useRef(form.validate)
  useEffect(() => {
    validateRef.current = () =>
      isFormInputHidden(formInput, formContext.form) ? true : form.validate()
  })

  const { registerSubForm } = formContext
  useEffect(() => registerSubForm?.(() => validateRef.current()), [registerSubForm])

  // On mount only: a block opened by a failed submission shows why
  const validateMountedForm = useEffectCallback(() => {
    if (validateOnMount) form.validate()
  })
  useEffect(() => {
    validateMountedForm()
  }, [validateMountedForm])

  return (
    <>
      <FormElement {...form} />

      {children}
    </>
  )
}
