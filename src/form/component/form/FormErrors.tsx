import { Text } from "@/ui/Text"
import { Trans } from "react-mini-i18n"
import { useEffect, useMemo, useRef } from "react"
import useFormContext from "@/form/provider/useFormContext"
import { getFormConfig } from "@/form/FormConfig"

// What can take the focus inside a field, whatever its controller renders
const FOCUSABLE =
  'input:not([type="hidden"]), select, textarea, button, [contenteditable="true"], [tabindex]'

/**
 * Brings the first invalid field of `root`, in display order, into view and
 * focuses its first focusable element.
 */
function focusFirstInvalidField(root: ParentNode | null) {
  const field = root?.querySelector<HTMLElement>("[data-invalid]")
  if (!field) return

  const target = [...field.querySelectorAll<HTMLElement>(FOCUSABLE)].find(
    (element) => !element.matches(':disabled, [tabindex="-1"], [aria-hidden="true"]')
  )

  field.scrollIntoView?.({ block: "center" })
  target?.focus({ preventScroll: true })
}

export default function FormErrors() {
  const formContext = useFormContext()
  const form = formContext.form
  const submitResult = formContext.submitResult
  const statusRef = useRef<HTMLDivElement>(null)

  const CurrentFormErrorsCurrent = useMemo(
    () =>
      form.components?.formErrors ??
      getFormConfig()?.defaultForm?.components?.formErrors,
    [form.components]
  )

  // Runs once the violations are rendered, so the fields are marked invalid
  useEffect(() => {
    if (submitResult?.status !== "error" || !statusRef.current) return
    focusFirstInvalidField(
      statusRef.current.closest("form, fieldset") ?? statusRef.current.parentElement
    )
  }, [submitResult])

  const showSuccess =
    submitResult?.status === "success" &&
    form.showSuccess !== false &&
    !!form.label?.success

  return (
    <>
      {CurrentFormErrorsCurrent ? (
        <CurrentFormErrorsCurrent />
      ) : (
        <DefaultFormErrors />
      )}
      {/* Always mounted: a live region only announces what changes inside it */}
      <div ref={statusRef} role="status" aria-live="polite">
        {showSuccess && (
          <Text variant="p">
            <Trans>{form.label.success}</Trans>
          </Text>
        )}
      </div>
    </>
  )
}

export function DefaultFormErrors() {
  const formContext = useFormContext()
  const form = formContext.form

  return (
    <>
      {formContext.submitResult?.status === "error" && form?.label?.error && (
        <Text variant="p" role="alert" className={"text-destructive"}>
          <Trans>{form.label.error}</Trans>
        </Text>
      )}
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
