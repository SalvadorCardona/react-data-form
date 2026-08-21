import { FC } from "react"
import { FormInputInterface } from "@/form/FormInputInterface"
import { InputControllerInterface } from "@/form/InputControllerInterface"
import { Trans } from "@/i18n/components/Trans"
import FormInputViolation from "@/form/component/FormInputViolation"
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
  // Identifiant stable pour associer le label au champ (accessibilité)
  const inputId =
    formInput.id ?? (formInput.name ? `field-${formInput.name}` : undefined)
  return (
    <Field className={"mb-2 mt-4"} data-field={fieldName || undefined}>
      {formInput.label !== null && (
        <FieldLabel htmlFor={inputId}>
          <Trans className={"fc"}>{label}</Trans> {formInput.required ? "*" : ""}
        </FieldLabel>
      )}
      <FormInputComponent
        formInput={{ ...formInput, id: inputId }}
        onChange={onChange}
      />
      {formInput?.description && (
        <FieldDescription>{formInput.description}</FieldDescription>
      )}
      <FormInputViolation formInput={formInput} />
    </Field>
  )
}
