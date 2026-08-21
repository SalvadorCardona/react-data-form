import { FormInputInterface } from "@/form/FormInputInterface"
import { memo } from "react"
import { FieldError } from "@/ui/field"
import ViolationInterface from "@/form/Violation"

interface FormInputViolationPropsInterface {
  formInput?: FormInputInterface
}

function FormInputViolation({ formInput }: FormInputViolationPropsInterface) {
  if (!formInput) return null

  return (
    <>
      {formInput?.violations?.map((msg, idx) => (
        <ViolationLine key={`${idx}-${msg}`} violation={msg} />
      ))}
    </>
  )
}

function ViolationLine({ violation }: { violation?: ViolationInterface }) {
  if (!violation) return null
  return <FieldError>{violation.message}</FieldError>
}

export default memo(FormInputViolation)
