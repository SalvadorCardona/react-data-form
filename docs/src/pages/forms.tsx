import { CompleteFormExample } from "../CompleteFormExample"
import { ConditionalFormExample } from "../ConditionalFormExample"
import { DirtyFormExample } from "../DirtyFormExample"
import { HydraFormExample } from "../HydraFormExample"
import { CodeBlock, LiveExample, PageHeader, Section } from "../DocLayout"
import { StepFormExample } from "../StepFormExample"
import { pageHref } from "./index"

export function FormsPage() {
  return (
    <>
      <PageHeader
        title="Building a form"
        intro="Fields, groups, steps and submission — the pieces that turn a list of inputs into something a person can fill in."
      />

      <Section
        title="A complete form"
        intro="Everything below runs in your browser. Submit it and watch the data appear."
      >
        <CompleteFormExample />
      </Section>

      <Section
        title="Conditional fields"
        intro="hidden(data, form) shows a field only when the data calls for it."
      >
        <p>
          <code>hidden</code> receives the current data of the form, and the form
          itself: the field follows the other values as they are typed. A hidden
          field is not validated — <code>required</code>, <code>min</code>,{" "}
          <code>max</code> and <code>validator</code> included — and its value is
          left out of the submitted data. Set <code>keepHiddenValue: true</code> to
          send it anyway.
        </p>
        <CodeBlock>{conditional}</CodeBlock>
        <LiveExample label="Switch the customer type">
          <ConditionalFormExample />
        </LiveExample>
      </Section>

      <Section
        title="Submitting"
        intro="Two callbacks, in this order: form.onSubmit sends, useForm({ onSubmit }) is told."
      >
        <p>
          <code>form.onSubmit</code>, on the declaration, sends the data — usually to
          the API. It may be synchronous or return a promise: the form stays loading,
          and the submit button disabled, until it settles. What it returns becomes
          the submitted data; returning nothing keeps the entered data.
        </p>
        <p>
          <code>useForm({"{ onSubmit }"})</code>, on the hook, then receives that
          data — never a promise — to react in the component: close a dialog,
          navigate, refresh a list.
        </p>
        <CodeBlock>{submitting}</CodeBlock>
      </Section>

      <Section
        title="Unsaved changes"
        intro="isDirty tells whether the values changed, reset() puts them back."
      >
        <p>
          <code>isDirty</code> compares the current values, deeply, with the ones the
          form was built with — or loaded by <code>asyncData</code>, or last
          submitted successfully. <code>reset()</code> brings those values back and
          clears the violations. After a successful submission,{" "}
          <code>form.originalData</code> takes the saved data, merged over the
          previous record so that its id is kept.
        </p>
        <p>
          With <code>warnOnLeave: true</code>, the browser asks for a confirmation
          before the page is closed or reloaded while the form is dirty — a
          back-office record no longer loses what was typed.
        </p>
        <CodeBlock>{dirty}</CodeBlock>
        <LiveExample label="Edit, then reset or save">
          <DirtyFormExample />
        </LiveExample>
      </Section>

      <Section
        title="Generating from API Platform"
        intro="react-data-form/hydra reads the Hydra documentation of the API and declares the fields."
      >
        <p>
          <code>createFormFromHydraClass(doc, classIri, options)</code> is a pure
          function: give it the document served on <code>/api/docs.jsonld</code> and
          the IRI of a class, it returns a <code>FormInterface</code>. Each property
          becomes a field labelled by its <code>hydra:title</code>, its controller
          picked from its range: <code>xsd:string</code> a text input,{" "}
          <code>xsd:integer</code> and <code>xsd:decimal</code> a number,{" "}
          <code>xsd:dateTime</code> a date picker, <code>xsd:boolean</code> a switch
          (the older <code>xmls:</code> prefix works too).
        </p>
        <p>
          A relation to another class becomes a searchable select — a multi-select
          for a collection — calling your <code>onSearch</code> with the relation.{" "}
          <code>hydra:required</code> sets <code>required</code>; a property that is
          not <code>hydra:writeable</code> is shown read-only, and one neither
          readable nor writeable is left out. <code>options.inputs</code> overrides a
          field, or removes it with <code>false</code>.
        </p>
        <CodeBlock>{hydra}</CodeBlock>
        <LiveExample label="Pick a book, then save">
          <HydraFormExample />
        </LiveExample>
      </Section>

      <Section
        title="Grouping fields"
        intro="react-data-form/group lays fields out in collapsible sections."
      >
        <p>
          A field declares which group it belongs to, and the form declares the
          groups and their order:
        </p>
        <CodeBlock>{groups}</CodeBlock>
        <p>
          A field with no <code>groups</code>, or whose groups are not listed in{" "}
          <code>itemGroups</code>, is not dropped: it is rendered in an untitled
          section after the groups. Set <code>ungroupedPosition: "start"</code> on{" "}
          <code>groupOption</code> to put that section before them.
        </p>
      </Section>

      <Section
        title="Splitting into steps"
        intro="react-data-form/step turns one form into a sequence, keeping a single state underneath."
      >
        <CodeBlock>{steps}</CodeBlock>
        <p>
          Moving to the next step never unmounts the form. When a step has an
          asynchronous <code>onNextStep</code> hook, the button shows a loader and
          the typed values stay in place:
        </p>
        <StepFormExample />
        <p>
          The navigation labels — <code>Previous</code>, <code>Next</code>,{" "}
          <code>Finish</code>, the step counter (
          <code>{"Step {{current}} of {{total}}"}</code>), <code>Invalid Form</code>{" "}
          — go through the translation dictionary, so they follow your application's
          language.
        </p>
      </Section>

      <Section
        title="Writing your own controller"
        intro="A component satisfying InputControllerInterface. No registration step."
      >
        <CodeBlock>{custom}</CodeBlock>
      </Section>

      <Section
        title="Next"
        intro="Every field type this library ships, running live."
      >
        <p>
          Continue to{" "}
          <a className="underline underline-offset-4" href={pageHref("controllers")}>
            Field controllers
          </a>
          .
        </p>
      </Section>
    </>
  )
}

const conditional = `inputs: {
  type: { label: "Customer", controller: SelectInputController, valueOptions },
  company: {
    label: "Company",
    required: true, // only checked while the field shows
    hidden: (data) => data.type !== "pro",
  },
}`

const submitting = `const formContext = useForm({
  form: {
    inputs: { email: { type: "email", label: "Email" } },
    onSubmit: (data) => api.patch("/me", data), // awaited
  },
  onSubmit: (savedUser) => navigate(\`/users/\${savedUser.id}\`),
})`

const dirty = `const formContext = useForm({ form, data: user, warnOnLeave: true })

<FormElement {...formContext} />
<button disabled={!formContext.isDirty} onClick={formContext.reset}>
  Reset
</button>`

const hydra = `import { createFormFromHydraClass } from "react-data-form/hydra"

const docs = await fetch("/api/docs.jsonld").then((response) => response.json())

const form = createFormFromHydraClass(docs, "#Review", {
  onSearch: (query, relation) => searchIris(relation.range, query),
  inputs: {
    body: { label: "Review" },
    letter: false, // left out
  },
})

const formContext = useForm({ form: { ...form, onSubmit: save } })`

const groups = `import { FormInputsGroup } from "react-data-form/group"

const form: FormInterface = {
  groupOption: {
    itemGroups: [
      { group: "identity", title: "Identity", order: 1 },
      { group: "contact", title: "Contact", order: 2 },
    ],
  },
  inputs: {
    firstName: { label: "First name", groups: ["identity"] },
    email: { label: "Email", groups: ["contact"] },
    notes: { label: "Notes" }, // no group: rendered after the groups
  },
  components: { formInputs: FormInputsGroup },
}`

const steps = `import { createStepForm } from "react-data-form/step"

const form = createStepForm({
  steps: [
    { group: "identity", title: "Who are you?", order: 1 },
    { group: "contact", title: "How do we reach you?", order: 2 },
  ],
  inputs: {
    firstName: { label: "First name", group: "identity" },
    email: { label: "Email", group: "contact" },
  },
})`

const custom = `const ColorInputController = ({ formInput, onChange }: InputControllerInterface) => (
  <input
    type="color"
    value={formInput.value ?? "#e46212"}
    onChange={(e) => onChange({ ...formInput, value: e.target.value })}
  />
)

inputs: {
  brandColor: { label: "Brand colour", controller: ColorInputController },
}`
