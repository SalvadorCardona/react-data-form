import { CompleteFormExample } from "../CompleteFormExample"
import { CodeBlock, PageHeader, Section } from "../DocLayout"

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
        title="Grouping fields"
        intro="react-data-form/group lays fields out in collapsible sections."
      >
        <p>
          A field declares which group it belongs to, and the form declares the
          groups and their order:
        </p>
        <CodeBlock>{groups}</CodeBlock>
      </Section>

      <Section
        title="Splitting into steps"
        intro="react-data-form/step turns one form into a sequence, keeping a single state underneath."
      >
        <CodeBlock>{steps}</CodeBlock>
        <p>
          The navigation labels — <code>Previous</code>, <code>Finish</code>,
          the step counter — go through the translation dictionary, so they
          follow your application's language.
        </p>
      </Section>

      <Section
        title="Writing your own controller"
        intro="A component satisfying InputControllerInterface. No registration step."
      >
        <CodeBlock>{custom}</CodeBlock>
      </Section>
    </>
  )
}

const groups = `import { FormInputsGroup } from "react-data-form/group"

const form: FormInterface = {
  groupOption: {
    itemGroups: [
      { group: "identity", title: "Identity", order: 1 },
      { group: "contact", title: "Contact", order: 2 },
    ],
  },
  inputs: {
    firstName: { label: "First name", group: "identity" },
    email: { label: "Email", group: "contact" },
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
    value={formInput.value ?? "#000000"}
    onChange={(e) => onChange({ ...formInput, value: e.target.value })}
  />
)

inputs: {
  brandColor: { label: "Brand colour", controller: ColorInputController },
}`
