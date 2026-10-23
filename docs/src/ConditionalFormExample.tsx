import { useState } from "react"
import {
  FormElement,
  type FormInterface,
  SelectInputController,
  useForm,
} from "react-data-form"

interface Customer {
  type: "private" | "pro"
  name: string
  company?: string
}

/**
 * « Company » only shows for a professional customer: its `hidden` reads the
 * data. Hidden, it is neither validated nor submitted.
 */
export function ConditionalFormExample() {
  const [submitted, setSubmitted] = useState<Customer | null>(null)

  const form: FormInterface<Customer> = {
    label: { submit: "Save" },
    inputs: {
      type: {
        label: "Customer",
        controller: SelectInputController,
        defaultValue: "private",
        valueOptions: [
          { label: "Private", value: "private" },
          { label: "Professional", value: "pro" },
        ],
      },
      name: { label: "Name" },
      company: {
        label: "Company",
        required: true,
        hidden: (data) => data.type !== "pro",
      },
    },
    onSubmit: (data) => {
      setSubmitted(data)
      return data
    },
  }

  const formContext = useForm<Customer>({ form })

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_14rem]">
      <div className="min-w-0">
        <FormElement {...formContext} />
      </div>
      <aside className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Submitted
        </p>
        <pre className="mt-2 max-h-52 overflow-auto rounded-md bg-muted p-3 text-xs">
          <code>
            {submitted
              ? JSON.stringify(submitted, null, 2)
              : "Nothing yet.\n\nSwitch to Professional:\nCompany shows up, and\nis required."}
          </code>
        </pre>
      </aside>
    </div>
  )
}
