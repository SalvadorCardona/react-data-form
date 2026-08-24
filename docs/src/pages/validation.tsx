import { useState } from "react"
import {
  FormElement,
  type FormInterface,
  PriceInputController,
  useForm,
} from "react-data-form"
import { CodeBlock, LiveExample, PageHeader, Section } from "../DocLayout"

interface Booking {
  email: string
  seats: number
  price: number
}

/**
 * A form whose rules fail on purpose, so the reader can see where a violation
 * lands rather than read about it.
 */
function ValidationExample() {
  const [submitted, setSubmitted] = useState<Booking | null>(null)

  const form: FormInterface<Booking> = {
    label: { title: "Book a seat", submit: "Book" },
    inputs: {
      email: {
        label: "Email",
        type: "email",
        required: true,
        placeholder: "you@example.com",
        validator: (value) => {
          const email = String(value ?? "")
          if (!email.includes("@")) throw new Error("That is not an email address")
          return value
        },
      },
      seats: {
        label: "Seats",
        type: "number",
        value: 1,
        validator: (value) => {
          if (Number(value) < 1) throw new Error("At least one seat")
          if (Number(value) > 4) throw new Error("Four seats at most")
          return value
        },
      },
      price: {
        label: "Budget",
        controller: PriceInputController,
        value: 0,
        validator: (value) => {
          if (Number(value) < 0) throw new Error("A budget cannot be negative")
          return value
        },
      },
    },
    onSubmit: (data) => {
      setSubmitted(data)
      return data
    },
  }

  const formContext = useForm<Booking>({ form })

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
              : "Nothing yet.\n\nTry five seats, or an\nemail without an @."}
          </code>
        </pre>
      </aside>
    </div>
  )
}

export function ValidationPage() {
  return (
    <>
      <PageHeader
        title="Validation & errors"
        intro="Rules live on the field, and a violation lands under the field it came from — whether it was raised here or by your API."
      />

      <Section
        title="Validation is per field"
        intro="A validator throws; the message becomes a violation under that field, and submission stops."
      >
        <CodeBlock>{validator}</CodeBlock>
        <p>
          <code>FormInterface</code> also exposes a <code>validator</code> key,
          but nothing calls it — rules belong on{" "}
          <code>inputs.&lt;name&gt;.validator</code>.
        </p>
        <LiveExample label="Try to break it">
          <ValidationExample />
        </LiveExample>
      </Section>

      <Section
        title="Errors from the API"
        intro="An API Platform response carries its violations in the problem+json body."
      >
        <p>
          <code>addErrorFromViolations</code> maps each one onto the field named
          by its <code>propertyPath</code>, so a server-side rule is displayed
          exactly like a local one. A violation with an empty path becomes a
          form-level error instead.
        </p>
        <CodeBlock>{apiErrors}</CodeBlock>
      </Section>

      <Section
        title="Zod, if you prefer"
        intro="A validator throwing a ZodError has each of its issues mapped to a violation."
      >
        <CodeBlock>{zod}</CodeBlock>
      </Section>
    </>
  )
}

const validator = `inputs: {
  seats: {
    label: "Seats",
    type: "number",
    validator: (value) => {
      if (Number(value) < 1) throw new Error("At least one seat")
      if (Number(value) > 4) throw new Error("Four seats at most")
      return value
    },
  },
}`

const apiErrors = `// { "violations": [{ "propertyPath": "email", "message": "Already taken" }] }
const withErrors = addErrorFromViolations(form, apiError)
// → the message appears under the email field`

const zod = `inputs: {
  email: {
    label: "Email",
    validator: (value) => z.string().email("That is not an email address").parse(value),
  },
}`
