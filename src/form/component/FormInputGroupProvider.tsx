import { FC } from "react"
import { FormInputInterface } from "@/form/FormInputInterface"
import { InputControllerInterface } from "@/form/InputControllerInterface"
import { Trans } from "react-mini-i18n"
import FormInputViolation from "@/form/component/FormInputViolation"
import {
  FieldControlAriaInterface,
  FieldControlContext,
  getFieldDescriptionId,
  getFieldErrorId,
} from "@/form/component/FieldControlContext"
import { Field, FieldDescription, FieldLabel } from "@/ui/field"

export interface FormGroupProviderPropsInterface {
  formInput: FormInputInterface
  onChange: (formInput: FormInputInterface) => void
  formInputComponent: FC<InputControllerInterface>
}

export default function FormInputGroupProvider({
  formInput,
  onChange,
  formInputComponent: FormInputComponent,
}: FormGroupProviderPropsInterface) {
  const label =
    formInput.label || formInput.label === "" ? formInput.label : formInput.name
  const fieldName = formInput.name || formInput.id
  // Stable id tying the label to its field, for accessibility
  const inputId =
    formInput.id ?? (formInput.name ? `field-${formInput.name}` : undefined)
  const violations =
    formInput.violations?.filter((violation) => violation?.message) ?? []
  // The control is described by its description then its error messages
  const describedBy = inputId
    ? [
        formInput.description ? getFieldDescriptionId(inputId) : null,
        ...violations.map((_, idx) => getFieldErrorId(inputId, idx)),
      ].filter(Boolean)
    : []
  const aria: FieldControlAriaInterface = {
    "aria-invalid": violations.length > 0 ? true : undefined,
    "aria-describedby": describedBy.length > 0 ? describedBy.join(" ") : undefined,
    "aria-required": formInput.required ? true : undefined,
  }
  return (
    <Field className={"mb-2 mt-4"} data-field={fieldName || undefined}>
      {formInput.label !== null && (
        <FieldLabel htmlFor={inputId}>
          <Trans className={"fc"}>{label}</Trans>{" "}
          {formInput.required && <span aria-hidden="true">*</span>}
        </FieldLabel>
      )}
      <FieldControlContext value={aria}>
        <FormInputComponent
          formInput={{ ...formInput, id: inputId }}
          onChange={onChange}
        />
      </FieldControlContext>
      {formInput?.description && (
        <FieldDescription id={inputId ? getFieldDescriptionId(inputId) : undefined}>
          {formInput.description}
        </FieldDescription>
      )}
      <FormInputViolation formInput={formInput} id={inputId} />
    </Field>
  )
}
