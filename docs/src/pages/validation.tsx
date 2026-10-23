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
    // Stands in for the API: it rejects the way API Platform answers a 422
    onSubmit: async (data) => {
      if (data.email === "taken@example.com") {
        throw {
          violations: [{ propertyPath: "email", message: "Already taken" }],
        }
      }
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
              : "Nothing yet.\n\nTry five seats, an email\nwithout an @, or\ntaken@example.com."}
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
          <code>FormInterface</code> also exposes a <code>validator</code> key, but
          nothing calls it — rules belong on{" "}
          <code>inputs.&lt;name&gt;.validator</code>.
        </p>
        <LiveExample label="Try to break it">
          <ValidationExample />
        </LiveExample>
      </Section>

      <Section
        title="Required fields"
        intro="An empty required field gets a violation before its validator runs, whatever its controller."
      >
        <CodeBlock>{required}</CodeBlock>
        <p>
          <code>undefined</code>, <code>null</code>, <code>""</code> and{" "}
          <code>[]</code> count as empty; <code>false</code> and <code>0</code> are
          answers. Hidden fields (<code>type: "hidden"</code> or{" "}
          <code>hidden()</code> returning true), generated values and fields outside
          the current group or step are not checked. The message is the translation
          key <code>This field is required</code>.
        </p>
      </Section>

      <Section
        title="Number bounds"
        intro="A number outside min or max is kept as typed and gets a violation; it is never clamped behind your back."
      >
        <CodeBlock>{bounds}</CodeBlock>
        <p>
          An emptied number field stores <code>null</code>, not <code>0</code>. The
          messages are the translation keys{" "}
          <code>This value should be greater than or equal to {"{{min}}"}</code> and{" "}
          <code>This value should be less than or equal to {"{{max}}"}</code>.
        </p>
      </Section>

      <Section
        title="Errors from the API"
        intro="When the submission rejects with an API Platform problem+json body, its violations land under their fields — no try/catch to write."
      >
        <CodeBlock>{apiErrors}</CodeBlock>
        <p>
          <code>useForm</code> catches what <code>form.onSubmit</code> or its own{" "}
          <code>onSubmit</code> throws, maps each violation onto the field named by
          its <code>propertyPath</code>, stops the loader, then calls{" "}
          <code>onError(error, form)</code> with the error as thrown — the place for
          a toast. A nested path such as <code>address.street</code> or{" "}
          <code>items[0].name</code> lands on the parent field (<code>address</code>,{" "}
          <code>items</code>). A violation with an empty path, or a path no field
          matches, becomes a form-level error in <code>form.errors</code>, displayed
          by <code>FormErrors</code>. The next submission clears them. An error with
          no violations and no <code>onError</code> to receive it is rethrown.
        </p>
        <p>
          The example above does it: submit <code>taken@example.com</code>.
        </p>
      </Section>

      <Section
        title="Another error format"
        intro="Tell the library once where your HTTP client or backend puts the violations."
      >
        <CodeBlock>{extractViolations}</CodeBlock>
        <p>
          The extractor returns an object with a <code>violations</code> array, or{" "}
          <code>undefined</code> when the error carries none. The default reads the
          error itself. <code>addErrorFromViolations(form, apiError)</code> stays
          exported to apply violations by hand.
        </p>
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

const required = `inputs: {
  country: {
    label: "Country",
    required: true,
    controller: SelectInputController,
    valueOptions: [{ label: "France", value: "fr" }],
  },
}
// Submitting with no country → "This field is required" under the field

setTranslation({ "This field is required": "Ce champ est obligatoire" })`

const bounds = `inputs: {
  quantity: { label: "Quantity", type: "number", min: 1, max: 10 },
}
// Typing 0 then submitting → "This value should be greater than or equal to 1"

setTranslation({
  "This value should be greater than or equal to {{min}}":
    "Cette valeur doit être supérieure ou égale à {{min}}",
})`

const apiErrors = `const formContext = useForm({
  form: {
    inputs: { email: { label: "Email" } },
    // The API answers 422:
    // { "violations": [{ "propertyPath": "email", "message": "Already taken" }] }
    onSubmit: (data) => api.post("/bookings", data),
  },
  onError: (error) => toast.error("The booking was not saved"),
})
// → "Already taken" appears under the email field

// { "violations": [{ "propertyPath": "", "message": "Fully booked" }] }
// → form.errors is ["Fully booked"], shown above the submit button`

const extractViolations = `import { setFormConfig } from "react-data-form"

setFormConfig({
  // axios: the problem+json body is on error.response.data
  extractViolations: (error) => error?.response?.data,
})`

const zod = `inputs: {
  email: {
    label: "Email",
    validator: (value) => z.string().email("That is not an email address").parse(value),
  },
}`
