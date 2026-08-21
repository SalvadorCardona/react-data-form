import InputControllerProvider from "@/form/component/InputControllerProvider"
import getFormInputInForm from "@/form/utils/getFormInputInForm"
import useFormContext from "@/form/provider/useFormContext"

export default function InputControllerProviderByName({
  formInputName,
}: {
  formInputName: string
}) {
  const { form } = useFormContext()

  const formInput = getFormInputInForm(form, formInputName)

  if (!formInput) {
    console.warn("Form Input not found with name : " + formInputName)
    return
  }

  return <InputControllerProvider formInput={formInput} />
}
