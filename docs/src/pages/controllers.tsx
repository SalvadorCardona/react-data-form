import { catalog } from "../catalog"
import { Demo } from "../Demo"
import { PageHeader, Section } from "../DocLayout"
import { pageHref } from "./index"

/**
 * The gallery: every field controller, rendered for real, grouped by what it
 * is for. Each demo shows the value it produces, which is the part a static
 * screenshot could never convey.
 */
export function ControllersPage() {
  return (
    <>
      <PageHeader
        title="Field controllers"
        intro="A controller is the component that renders one field. It receives { formInput, onChange } and knows nothing else about the form — which is all it takes to write your own."
      />

      <Section
        title="Choosing one"
        intro="Without a controller, a field falls back to DefaultInputController: an HTML input driven by its type."
      >
        <p>
          For anything else, name it explicitly — that is the entire selection
          mechanism, there is no registry to declare:
        </p>
        <pre className="not-prose my-4 overflow-x-auto rounded-lg border border-border bg-muted/60 p-4 text-sm">
          <code>{`inputs: {
  description: { controller: WysiwygInputController },
}`}</code>
        </pre>
      </Section>

      {catalog.map((group) => (
        <Section key={group.id} title={group.title} intro={group.description}>
          <div className="not-prose mt-4 space-y-5">
            {group.demos.map((demo) => (
              <Demo key={demo.name} demo={demo} />
            ))}
          </div>
        </Section>
      ))}

      <Section
        title="Next"
        intro="One array field, entries of different shapes."
      >
        <p>
          Continue to{" "}
          <a
            className="underline underline-offset-4"
            href={pageHref("multi-forms")}
          >
            Asymmetric forms
          </a>
          .
        </p>
      </Section>
    </>
  )
}
