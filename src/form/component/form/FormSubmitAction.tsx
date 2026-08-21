import { useMemo } from "react"
import { Button } from "@/ui/button"
import useFormContext from "@/form/provider/useFormContext"
import { getFormConfig } from "@/form/FormConfig"
import { ActionList } from "@/internal/action/ActionList"
import { Trans } from "react-mini-i18n"

export default function FormSubmitAction() {
  const formContext = useFormContext()
  const form = formContext.form

  const CurrentFormSubmitAction = useMemo(
    () =>
      form.components?.formSubmitAction ??
      getFormConfig()?.defaultForm?.components?.formSubmitAction,
    [form.components]
  )

  if (CurrentFormSubmitAction) {
    return <CurrentFormSubmitAction />
  }

  return <DefaultFormSubmitAction />
}

export function DefaultFormSubmitAction() {
  const formContext = useFormContext()
  const form = formContext.form
  const label = form.label?.submit

  if (formContext.form.action === ActionList.read || form?.saveOnChange) {
    return <></>
  }

  return (
    <>
      <div className={"mt-5 col-span-full "}>
        <Button
          type="button"
          className={"w-full"}
          size={"lg"}
          disabled={formContext.form.loading}
          onClick={() => formContext.onSubmit()}
        >
          <span className={"fc"}>
            <Trans>{label ?? form.action}</Trans>
          </span>
        </Button>
      </div>
    </>
  )
}
