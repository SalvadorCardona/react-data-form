import { FormElement, type FormInterface, useForm } from "react-data-form"

interface Profile {
  name: string
  email: string
}

const form: FormInterface<Profile> = {
  label: { submit: "Save" },
  inputs: {
    name: { label: "Name" },
    email: { type: "email", label: "Email" },
  },
  onSubmit: (data) => data,
}

/**
 * `isDirty` follows the typing, `reset()` brings the saved values back, and
 * `warnOnLeave` asks before the page is left with unsaved changes.
 */
export function DirtyFormExample() {
  const formContext = useForm<Profile>({
    form,
    data: { name: "Ada Lovelace", email: "ada@example.com" },
    warnOnLeave: true,
  })

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_14rem]">
      <div className="min-w-0">
        <FormElement {...formContext} />
      </div>
      <aside className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          State
        </p>
        <p className="mt-2 rounded-md bg-muted p-3 text-xs" aria-live="polite">
          {formContext.isDirty ? "Unsaved changes" : "Nothing to save"}
        </p>
        <button
          type="button"
          className="mt-3 rounded-md border border-border px-3 py-1.5 text-sm disabled:opacity-50"
          disabled={!formContext.isDirty}
          onClick={formContext.reset}
        >
          Reset
        </button>
      </aside>
    </div>
  )
}
