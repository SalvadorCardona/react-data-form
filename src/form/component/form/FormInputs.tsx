import InputControllerProvider from "@/form/component/InputControllerProvider"
import useFormContext from "@/form/provider/useFormContext"
import getFormInputsFromForm from "@/form/utils/getFormInputsFromForm"

export default function FormInputs() {
  const formContext = useFormContext()
  const form = formContext.form

  const CurrentFormInputs = form.components?.formInputs

  if (CurrentFormInputs) {
    return <CurrentFormInputs />
  }

  return <DefaultFormInputs />
}

export function DefaultFormInputs() {
  const formContext = useFormContext()
  const form = formContext.form
  const inputs = getFormInputsFromForm(form)

  if (!form.inputs) {
    return
  }

  return (
    <>
      {inputs.map((formInput) => {
        return (
          <InputControllerProvider
            key={(formInput?.id as string) + formInput?.name + form.version}
            formInput={formInput}
          />
        )
      })}
    </>
  )
}
