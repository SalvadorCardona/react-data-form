import { FormInputInterface } from "@/form/FormInputInterface"
import { memo } from "react"
import { FieldError } from "@/ui/field"
import ViolationInterface from "@/form/Violation"
import { getFieldErrorId } from "@/form/component/FieldControlContext"

interface FormInputViolationPropsInterface {
  formInput?: FormInputInterface
  /** Id of the field: each message gets an id its control can reference. */
  id?: string
}

function FormInputViolation({ formInput, id }: FormInputViolationPropsInterface) {
  if (!formInput) return null

  return (
    <>
      {formInput?.violations
        ?.filter((violation) => violation?.message)
        .map((msg, idx) => (
          <ViolationLine
            key={`${idx}-${msg}`}
            violation={msg}
            id={id ? getFieldErrorId(id, idx) : undefined}
          />
        ))}
    </>
  )
}

function ViolationLine({
  violation,
  id,
}: {
  violation?: ViolationInterface
  id?: string
}) {
  if (!violation) return null
  return <FieldError id={id}>{violation.message}</FieldError>
}

export default memo(FormInputViolation)
