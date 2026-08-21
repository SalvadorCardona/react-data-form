import { cn } from "@/ui/cn"
import FormErrors from "@/form/component/form/FormErrors"
import FormSubmitAction from "@/form/component/form/FormSubmitAction"
import FormInputs from "@/form/component/form/FormInputs"
import { FormContextOutput } from "@/form/hook/useForm"
import FormProvider from "@/form/provider/FormProvider"
import { FormDecorator } from "@/form/component/form/FormDecorator"
import { FormHeader } from "@/form/component/form/FormHeader"

const FormElement = (props: FormContextOutput & { className?: string }) => {
  return (
    <FormProvider formContext={props}>
      <FormDecorator className={cn(props.form?.className, props.className)}>
        <FormHeader />
        <FormInputs />
        <FormErrors />
        <FormSubmitAction />
      </FormDecorator>
    </FormProvider>
  )
}

export default FormElement
