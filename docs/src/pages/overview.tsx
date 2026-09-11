import { CodeBlock, PageHeader, Section } from "../DocLayout"
import { pageHref } from "./index"

export function OverviewPage() {
  return (
    <>
      <PageHeader
        title="react-data-form"
        intro="Data-driven React forms. You describe a form as an object; the library renders the fields, holds the state, validates, and reports the errors your API sends back."
      />

      <Section
        title="A form is data"
        intro="Nothing is hardcoded in JSX, so the same description can be stored, transformed, or generated from an API schema."
      >
        <CodeBlock>{example}</CodeBlock>
        <p>
          That object is the whole contract. Change the shape and the form
          follows — which is what lets a page builder, an admin screen or a
          schema-driven CRUD reuse the same renderer.
        </p>
      </Section>

      <Section title="Installation">
        <CodeBlock>{install}</CodeBlock>
        <p>
          <code>react-mini-i18n</code> owns a module-level dictionary, so it is
          a peer dependency and must resolve to a single copy — two would leave
          half your labels untranslated.
        </p>
      </Section>

      <Section title="Styles">
        <p>
          The components are written with Tailwind CSS v4 classes backed by the
          shadcn theme variables. Tailwind must scan the compiled files:
        </p>
        <CodeBlock>{styles}</CodeBlock>
        <p>
          If your application already has a shadcn theme, skip the stylesheet
          import — the library will pick up your palette.
        </p>
      </Section>

      <Section title="Where to go next">
        <ul className="not-prose mt-4 space-y-2 text-muted-foreground">
          <li>
            <a className="underline underline-offset-4" href={pageHref("controllers")}>
              Field controllers
            </a>{" "}
            — every field type, running.
          </li>
          <li>
            <a className="underline underline-offset-4" href={pageHref("forms")}>
              Building a form
            </a>{" "}
            — groups, steps, and a complete example.
          </li>
          <li>
            <a className="underline underline-offset-4" href={pageHref("multi-forms")}>
              Asymmetric forms
            </a>{" "}
            — one array, entries of different shapes.
          </li>
          <li>
            <a className="underline underline-offset-4" href={pageHref("validation")}>
              Validation &amp; errors
            </a>{" "}
            — per-field rules and what the API sends back.
          </li>
        </ul>
      </Section>

      <Section
        title="Other projects"
        intro="This library is one piece of a set built around the same JSON-LD conventions."
      >
        <ul className="not-prose mt-4 space-y-2 text-muted-foreground">
          <li>
            <a
              className="underline underline-offset-4"
              href="https://github.com/SalvadorCardona/react-resource-view"
            >
              React Resource View
            </a>{" "}
            — CRUD views for JSON-LD / Hydra APIs: list, read, create, update
            and delete, in table, card, calendar or timeline layouts.
          </li>
          <li>
            <a
              className="underline underline-offset-4"
              href="https://cardona.digital"
            >
              cardona.digital
            </a>{" "}
            — the portfolio of Salvador Cardona, who writes both.
          </li>
        </ul>
      </Section>
    </>
  )
}

const example = `import { DatePickerInputController, FormElement, useForm } from "react-data-form"

const formContext = useForm({
  form: {
    label: { title: "My profile" },
    inputs: {
      firstName: { label: "First name" },
      email: { type: "email", label: "Email" },
      birthDate: { label: "Born on", controller: DatePickerInputController },
    },
    onSubmit: (data) => api.patch("/me", data),
  },
})

return <FormElement {...formContext} />`

const install = `pnpm add react-data-form react-mini-i18n resource-registry`

const styles = `@import "tailwindcss";
@source "../node_modules/react-data-form/dist";

/* Only if you have no shadcn theme of your own */
@import "react-data-form/styles.css";`
