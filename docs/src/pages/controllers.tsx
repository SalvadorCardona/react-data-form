import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { MediaObjectProvider } from "react-data-form/media"
import { catalog, mediaPort } from "../catalog"
import { Demo } from "../Demo"
import { PageHeader, Section } from "../DocLayout"
import { pageHref } from "./index"

/**
 * The gallery: every field controller, rendered for real, grouped by what it
 * is for. Each demo shows the value it produces, which is the part a static
 * screenshot could never convey, and the same field in each of its states —
 * side by side, a controller that does not look like the others stands out.
 */
export function ControllersPage() {
  return (
    <MediaObjectProvider port={mediaPort}>
      <PageHeader
        title="Field controllers"
        intro="A controller is the component that renders one field. It receives { formInput, onChange } and knows nothing else about the form — which is all it takes to write your own."
      />

      <ThemeToggle />

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

      <Section title="Next" intro="One array field, entries of different shapes.">
        <p>
          Continue to{" "}
          <a className="underline underline-offset-4" href={pageHref("multi-forms")}>
            Asymmetric forms
          </a>
          .
        </p>
      </Section>
    </MediaObjectProvider>
  )
}

/**
 * Switches the library's theme between light and dark, so every controller can
 * be checked in both. The library's dark palette hangs off a `dark` class.
 */
function ThemeToggle() {
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  )

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
  }, [dark])

  const Icon = dark ? Sun : Moon

  return (
    <button
      type="button"
      onClick={() => setDark((current) => !current)}
      className="mb-10 inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
    >
      <Icon className="size-4" />
      {dark ? "Light theme" : "Dark theme"}
    </button>
  )
}
