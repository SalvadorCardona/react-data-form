import { useEffect, useState } from "react"
import { configurePorts } from "react-data-form"
import { catalog } from "./catalog"
import { Demo } from "./Demo"
import { CodeBlock, Section } from "./ui"
import { CompleteFormExample } from "./CompleteFormExample"

// The site itself configures the library, which doubles as a worked example.
configurePorts({
  intlLocale: "en-GB",
  currency: "EUR",
})

const sections = [
  { id: "start", title: "Getting started" },
  { id: "concepts", title: "Concepts" },
  { id: "example", title: "A complete form" },
  ...catalog.map((group) => ({ id: group.id, title: group.title })),
]

export function App() {
  const active = useActiveSection(sections.map((section) => section.id))
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="mx-auto flex min-h-full max-w-6xl gap-8 px-4 lg:px-8">
      <Sidebar
        sections={sections}
        active={active}
        open={menuOpen}
        onNavigate={() => setMenuOpen(false)}
      />

      <main className="min-w-0 flex-1 py-10 lg:py-16">
        <Header onToggleMenu={() => setMenuOpen((open) => !open)} />

        <Section id="start" title="Getting started">
          <p>
            A form is an object. You list its fields, the library renders them,
            holds the state, validates, and reports the errors your API sends
            back. Nothing is hardcoded in JSX, so the same description can be
            stored, transformed, or generated from an API schema.
          </p>
          <CodeBlock>{install}</CodeBlock>
          <p>
            Tailwind must scan the library's compiled files to generate the
            classes it uses. If your application has no shadcn theme yet, import
            the neutral one shipped here; otherwise leave it out and the library
            picks up your own palette.
          </p>
          <CodeBlock language="css">{styles}</CodeBlock>
        </Section>

        <Section id="concepts" title="Concepts">
          <h3>Fields delegate rendering to a controller</h3>
          <p>
            Every field is rendered by a <em>controller</em>: a React component
            receiving <code>{"{ formInput, onChange }"}</code> and needing to
            know nothing else about the form. Without one, a field falls back to{" "}
            <code>DefaultInputController</code>, an HTML input driven by its{" "}
            <code>type</code>.
          </p>
          <p>
            Writing your own means writing a component that satisfies{" "}
            <code>InputControllerInterface</code> — there is no registration
            step:
          </p>
          <CodeBlock>{customController}</CodeBlock>

          <h3>The application supplies what the library refuses to assume</h3>
          <p>
            No backend, no router, no visual identity, no country. Those go
            through ports injected once at startup — each with a default, so the
            library works unconfigured.
          </p>
          <CodeBlock>{ports}</CodeBlock>
        </Section>

        <Section id="example" title="A complete form">
          <p>
            Fields, validation and submission together. Everything below runs in
            your browser: submit it and watch the errors and the resulting data.
          </p>
          <CompleteFormExample />
        </Section>

        {catalog.map((group) => (
          <Section key={group.id} id={group.id} title={group.title}>
            <p>{group.description}</p>
            <div className="not-prose mt-6 space-y-5">
              {group.demos.map((demo) => (
                <Demo key={demo.name} demo={demo} />
              ))}
            </div>
          </Section>
        ))}

        <footer className="mt-16 border-t border-border pt-6 text-sm text-muted-foreground">
          <a
            className="underline underline-offset-4 hover:text-foreground"
            href="https://github.com/SalvadorCardona/react-data-form"
          >
            Source on GitHub
          </a>
          <span className="px-2">·</span>
          MIT
        </footer>
      </main>
    </div>
  )
}

function Header({ onToggleMenu }: { onToggleMenu: () => void }) {
  return (
    <header className="mb-12">
      <button
        type="button"
        onClick={onToggleMenu}
        className="mb-6 rounded-md border border-border px-3 py-1.5 text-sm lg:hidden"
      >
        Contents
      </button>
      <h1 className="text-4xl font-semibold tracking-tight">react-data-form</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
        Data-driven React forms. Describe a form as an object; the library
        renders the fields, holds the state, validates, and reports the errors
        your API sends back.
      </p>
      <div className="mt-5 flex flex-wrap gap-2 text-sm">
        <a
          className="rounded-md bg-primary px-3 py-1.5 text-primary-foreground transition-opacity hover:opacity-90"
          href="#start"
        >
          Get started
        </a>
        <a
          className="rounded-md border border-border px-3 py-1.5 transition-colors hover:bg-accent hover:text-accent-foreground"
          href="https://github.com/SalvadorCardona/react-data-form"
        >
          GitHub
        </a>
      </div>
    </header>
  )
}

function Sidebar({
  sections,
  active,
  open,
  onNavigate,
}: {
  sections: { id: string; title: string }[]
  active: string
  open: boolean
  onNavigate: () => void
}) {
  return (
    <nav
      className={`${open ? "block" : "hidden"} fixed inset-x-0 top-0 z-20 max-h-full overflow-y-auto border-b border-border bg-background p-6 lg:sticky lg:top-0 lg:block lg:h-screen lg:w-52 lg:shrink-0 lg:border-b-0 lg:bg-transparent lg:py-16`}
    >
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Contents
      </p>
      <ul className="space-y-1 text-sm">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              onClick={onNavigate}
              className={`block rounded-md px-2 py-1 transition-colors ${
                active === section.id
                  ? "bg-accent font-medium text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {section.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

/** Highlights the section currently on screen in the sidebar. */
function useActiveSection(ids: string[]): string {
  const [active, setActive] = useState(ids[0] ?? "")

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
        if (visible) setActive(visible.target.id)
      },
      { rootMargin: "-10% 0px -70% 0px" }
    )

    ids.forEach((id) => {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [ids.join(",")])

  return active
}

const install = `pnpm add react-data-form react-mini-i18n resource-registry`

const styles = `@import "tailwindcss";
@source "../node_modules/react-data-form/dist";

/* Only if you have no shadcn theme of your own */
@import "react-data-form/styles.css";`

const customController = `const ColorInputController = ({ formInput, onChange }: InputControllerInterface) => (
  <input
    type="color"
    value={formInput.value ?? "#000000"}
    onChange={(e) => onChange({ ...formInput, value: e.target.value })}
  />
)

inputs: {
  brandColor: { label: "Brand colour", controller: ColorInputController },
}`

const ports = `import { configurePorts } from "react-data-form"
import { fr } from "date-fns/locale"

configurePorts({
  dateLocale: fr,          // date fields; defaults to US English
  intlLocale: "fr-FR",     // Intl formatting for dates and amounts
  currency: "EUR",         // currency used to render prices
  components: {
    iriLabel: ({ iri }) => <ResourceName iri={iri} />,
    logo: MyLogo,
  },
})`
