import { useState } from "react"
import {
  FormElement,
  type FormInputInterface,
  type FormInterface,
  useForm,
} from "react-data-form"
import type { DemoInterface } from "./catalog"

/** Renders the field definition the way you would write it in your own code. */
const snippet = (demo: DemoInterface): string => {
  const entries = Object.entries(demo.input)
    .filter(([key]) => key !== "value")
    .map(([key, value]) => {
      if (key === "controller") return `  controller: ${demo.name},`
      if (key === "onSearch") return `  onSearch: searchCountries,`
      if (typeof value === "string") return `  ${key}: ${JSON.stringify(value)},`
      if (Array.isArray(value)) return `  ${key}: [/* ${value.length} options */],`
      return `  ${key}: ${JSON.stringify(value)},`
    })

  return `inputs: {\n  fieldName: {\n  ${entries.join("\n  ")}\n  },\n}`
}

/**
 * One live field: a real form on the left, the value it produces on the right.
 *
 * Each demo owns its form so that trying one field cannot disturb another.
 */
export function Demo({ demo }: { demo: DemoInterface }) {
  const [showCode, setShowCode] = useState(false)
  const [value, setValue] = useState<unknown>(demo.input.value)

  const form: FormInterface = {
    saveOnChange: true,
    label: {},
    components: {
      // A single field needs neither a header nor a submit button.
      formSubmitAction: () => null,
    },
    inputs: { field: demo.input as FormInputInterface },
    onSubmit: (data) => data,
  }

  const formContext = useForm({
    form,
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
        <button
          type="button"
          onClick={() => setShowCode((shown) => !shown)}
          className="shrink-0 rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          {showCode ? "Hide code" : "Show code"}
        </button>
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

      {showCode && (
        <pre className="overflow-x-auto border-t border-border bg-muted/50 px-5 py-4 text-xs leading-relaxed">
          <code>{snippet(demo)}</code>
        </pre>
      )}
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
