import { PropsWithChildren } from "react"
import useFormContext from "@/form/provider/useFormContext"
import Loader from "@/ui/Loader"
import FormErrors from "@/form/component/form/FormErrors"

export type FormDecoratorPropsInterface = PropsWithChildren & {
  className?: string
}

export function FormDecorator({ children, className }: FormDecoratorPropsInterface) {
  const formContext = useFormContext()
  const ready = formContext.ready ?? true
  const { form } = formContext
  const Decorator = form.components?.formDecorator
  const saveOnChange = !!form.saveOnChange

  if (!ready) {
    return <Loader />
  }

  // The data could not be loaded: show why, not an empty form to submit
  if (formContext.loadError !== undefined) {
    return <FormErrors />
  }

  if (Decorator) {
    return <Decorator className={className}>{children}</Decorator>
  }

  // A sub-form lives inside its parent's <form>, which a <form> cannot
  if (formContext.parentFormContext?.form) {
    return <fieldset className={className}>{children}</fieldset>
  }

  return (
    <form
      className={className}
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        if (!saveOnChange) {
          // The rejection is left to the onSubmit caller: nothing to do here
          formContext.onSubmit().catch(() => {})
        }
      }}
    >
      {children}
      {/* Hidden field: enables implicit submission on the Enter key */}
      {!saveOnChange && (
        <input type="submit" hidden tabIndex={-1} aria-hidden="true" />
      )}
    </form>
  )
}
