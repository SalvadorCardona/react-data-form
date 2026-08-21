import { useState } from "react"
import {
  ActionList,
  DatePickerInputController,
  FormElement,
  type FormInterface,
  PriceInputController,
  SelectInputController,
  SwitchInputController,
  TextAreaInputController,
  useForm,
} from "react-data-form"

interface EventDraft {
  title: string
  category: string
  startsAt: string
  price: number
  description: string
  published: boolean
}

/**
 * A whole form rather than a single field: several controllers, a validator,
 * and a submit handler standing in for an API call.
 */
export function CompleteFormExample() {
  const [submitted, setSubmitted] = useState<EventDraft | null>(null)

  const form: FormInterface<EventDraft> = {
    action: ActionList.create,
    label: {
      title: "New event",
      description: "Every field below is live.",
      submit: "Create event",
      success: "Event created",
      error: "Some fields need your attention",
    },
    inputs: {
      // Validation is per field: throwing from a validator turns into a
      // violation displayed under that field, and blocks submission.
      title: {
        label: "Title",
        placeholder: "Spring meetup",
        required: true,
        validator: (value) => {
          if (!String(value ?? "").trim()) throw new Error("A title is required")
          return value
        },
      },
      category: {
        label: "Category",
        controller: SelectInputController,
        valueOptions: [
          { label: "Meetup", value: "meetup" },
          { label: "Workshop", value: "workshop" },
          { label: "Conference", value: "conference" },
        ],
      },
      startsAt: { label: "Starts on", controller: DatePickerInputController },
      price: {
        label: "Price",
        controller: PriceInputController,
        value: 0,
        validator: (value) => {
          if (Number(value) < 0) throw new Error("The price cannot be negative")
          return value
        },
      },
      description: {
        label: "Description",
        controller: TextAreaInputController,
        placeholder: "What is it about?",
      },
      published: { label: "Publish now", controller: SwitchInputController },
    },
    onSubmit: (data) => {
      setSubmitted(data)
      return data
    },
  }

  const formContext = useForm<EventDraft>({ form })

  return (
    <div className="not-prose mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_16rem]">
      <div className="min-w-0 rounded-xl border border-border bg-card p-5">
        <FormElement {...formContext} />
      </div>

      <aside className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Submitted data
        </p>
        <pre className="mt-2 max-h-72 overflow-auto rounded-md bg-muted p-3 text-xs leading-relaxed">
          <code>
            {submitted
              ? JSON.stringify(submitted, null, 2)
              : "Nothing submitted yet.\n\nTry leaving the title empty to\nsee validation in place."}
          </code>
        </pre>
      </aside>
    </div>
  )
}
