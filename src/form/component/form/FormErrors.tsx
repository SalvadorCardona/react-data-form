import { Text } from "@/ui/Text"
import { Trans } from "@/i18n/components/Trans"
import { useMemo } from "react"
import useFormContext from "@/form/provider/useFormContext"
import { getFormConfig } from "@/form/FormConfig"

export default function FormErrors() {
  const formContext = useFormContext()
  const form = formContext.form

  const CurrentFormErrorsCurrent = useMemo(
    () =>
      form.components?.formErrors ??
      getFormConfig()?.defaultForm?.components?.formErrors,
    [form.components]
  )

  if (CurrentFormErrorsCurrent) {
    return <CurrentFormErrorsCurrent />
  }

  return <DefaultFormErrors />
}

export function DefaultFormErrors() {
  const formContext = useFormContext()
  const form = formContext.form

  return (
    <>
      {form?.errors &&
        form?.errors?.length > 0 &&
        form.errors?.map((e) => (
          <Text variant="p" key={e}>
            <Trans>{e}</Trans>
          </Text>
        ))}
    </>
  )
}
