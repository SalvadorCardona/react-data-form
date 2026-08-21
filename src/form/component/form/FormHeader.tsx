import useFormContext from "@/form/provider/useFormContext"
import { FieldDescription, FieldLegend, FieldSet } from "@/ui/field"

export function FormHeader() {
  const form = useFormContext().form
  const title = form.label.title
  const description = form.label.description

  if (!title && !description) {
    return
  }

  return (
    <FieldSet className={"col-span-full"}>
      {title && <FieldLegend>{title}</FieldLegend>}
      {description && <FieldDescription>{description}</FieldDescription>}
    </FieldSet>
  )
}
