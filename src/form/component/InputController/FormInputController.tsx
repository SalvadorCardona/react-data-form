import { InputControllerInterface } from "@/form/InputControllerInterface"
import { FormInputInterface } from "@/form/FormInputInterface"
import { FormInterface } from "@/form/FormInterface"
import useForm from "@/form/hook/useForm"
import FormElement from "@/form/component/form/FormElement"
import { PropsWithChildren } from "react"
import useFormContext from "@/form/provider/useFormContext"

interface FormInputControllerPropsInterface
  extends
    InputControllerInterface<FormInputInterface<FormInterface>>,
    PropsWithChildren {}

export const FormInputController = ({
  formInput,
  onChange,
  children,
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

  return (
    <>
      <FormElement {...form} />

      {children}
    </>
  )
}
