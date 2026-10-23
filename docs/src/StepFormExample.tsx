import { FormElement, useForm } from "react-data-form"
import { createStepForm, type FormWithStepsBuild } from "react-data-form/step"

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * A two-step form whose first step checks something "on the server" before
 * moving on. Press Next: the form stays on screen with its values, and the
 * button shows a loader until the check is over.
 */
export function StepFormExample() {
  const form = createStepForm({
    inputs: {
      firstName: { label: "First name", groups: ["identity"] },
      email: { label: "Email", groups: ["contact"] },
    },
    groupOption: {
      itemGroups: [
        {
          group: "identity",
          title: "Who are you?",
          order: 1,
          onNextStep: async ({ form }) => {
            await wait(1200)
            return form as FormWithStepsBuild
          },
        },
        { group: "contact", title: "How do we reach you?", order: 2 },
      ],
    },
    onSubmit: (data) => data,
  })

  const formContext = useForm({ form })

  return (
    <div className="not-prose mt-6 rounded-xl border border-border bg-card p-5">
      <FormElement {...formContext} />
    </div>
  )
}
