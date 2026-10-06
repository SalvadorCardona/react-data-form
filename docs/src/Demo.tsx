import { useState } from "react"
import {
  FormElement,
  type FormInputInterface,
  type FormInterface,
  useForm,
} from "react-data-form"
import type { DemoInterface } from "./catalog"

/** What to write in `inputs` to get this controller. */
export const declaration = (demo: DemoInterface): string => {
  if (demo.input.controller) return `controller: ${demo.name}`
  if (demo.input.form) return "form: { inputs: { … } }"
  return "no controller — the field's type drives it"
}

/** Renders the field definition the way you would write it in your own code. */
const snippet = (demo: DemoInterface): string => {
  const entries = Object.entries(demo.input)
    .filter(([key]) => key !== "value")
    .map(([key, value]) => {
      if (key === "controller") return `  controller: ${demo.name},`
      if (key === "onSearch") return `  onSearch: searchCountries,`
      if (key === "form") {
        return `  form: { inputs: { /* ${Object.keys(value.inputs).join(", ")} */ } },`
      }
      if (typeof value === "string") return `  ${key}: ${JSON.stringify(value)},`
      if (Array.isArray(value)) return `  ${key}: [/* ${value.length} options */],`
      return `  ${key}: ${JSON.stringify(value)},`
    })

  const imports = demo.input.controller
    ? `import { ${demo.name} } from "${demo.from ?? "react-data-form"}"\n\n`
    : ""

  return `${imports}inputs: {\n  fieldName: {\n  ${entries.join("\n  ")}\n  },\n}`
}

/** A form holding the one field, with neither header nor submit button. */
const singleFieldForm = (input: FormInputInterface): FormInterface => ({
  saveOnChange: true,
  label: {},
  components: {
    formSubmitAction: () => null,
  },
  inputs: { field: input },
  onSubmit: (data) => data,
})

/** The states a field can be seen in, side by side, each in a form of its own. */
const states = (demo: DemoInterface) => [
  { label: "Empty", input: { ...demo.input, value: undefined } },
  ...(demo.filled === undefined
    ? []
    : [{ label: "Filled", input: { ...demo.input, value: demo.filled } }]),
  {
    label: "Error",
    input: {
      ...demo.input,
      value: undefined,
      violations: [{ message: "This value is not valid." }],
    },
  },
  ...(demo.readonly === false
    ? []
    : [
        {
          label: "Read-only",
          input: { ...demo.input, value: demo.filled, readonly: true },
        },
      ]),
]

function FieldState({ label, input }: { label: string; input: FormInputInterface }) {
  const formContext = useForm({ form: singleFieldForm(input) })

  return (
    <div className="min-w-0" data-state={label}>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <FormElement {...formContext} />
    </div>
  )
}

/**
 * One live field: a real form on the left, the value it produces on the right,
 * then the same field empty, filled, in error and read-only, then the code.
 *
 * Each demo owns its form so that trying one field cannot disturb another.
 */
export function Demo({ demo }: { demo: DemoInterface }) {
  const [value, setValue] = useState<unknown>(demo.input.value)

  const formContext = useForm({
    form: singleFieldForm(demo.input),
    onChange: (data: Record<string, unknown>) => setValue(data.field),
  })

  return (
    <article
      id={demo.name}
      className="scroll-mt-24 rounded-xl border border-border bg-card"
    >
      <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border px-5 py-3">
        <div>
          <h3 className="font-mono text-sm font-semibold">{demo.name}</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">{demo.summary}</p>
        </div>
        <code className="shrink-0 rounded-md bg-muted px-2 py-1 font-mono text-xs">
          {declaration(demo)}
        </code>
      </header>

      <div className="grid gap-5 p-5 md:grid-cols-[minmax(0,1fr)_14rem]">
        <div className="min-w-0">
          <FormElement {...formContext} />
        </div>

        <aside className="min-w-0 md:border-l md:border-border md:pl-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Value
          </p>
          <pre className="mt-2 max-h-40 overflow-auto rounded-md bg-muted p-3 text-xs leading-relaxed">
            <code>{format(value)}</code>
          </pre>
        </aside>
      </div>

      <div className="grid gap-5 border-t border-border px-5 py-4 sm:grid-cols-2 xl:grid-cols-4">
        {states(demo).map((state) => (
          <FieldState key={state.label} {...state} />
        ))}
      </div>

      <pre className="overflow-x-auto border-t border-border bg-muted/50 px-5 py-4 text-xs leading-relaxed">
        <code>{snippet(demo)}</code>
      </pre>
    </article>
  )
}

const format = (value: unknown): string => {
  if (value === undefined) return "undefined"
  if (value === null) return "null"
  if (typeof value === "string" && value.length > 220) {
    return JSON.stringify(value.slice(0, 220) + "…", null, 2)
  }
  return JSON.stringify(value, null, 2)
}
