import { describe, expect, it } from "vitest"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import FormElement from "@/form/component/form/FormElement"
import useForm from "@/form/hook/useForm"
import { createStepForm, FormWithStepsBuild } from "@/step/FormStep"

function StepForm({ onNextStep }: { onNextStep?: () => Promise<void> }) {
  const form = createStepForm({
    inputs: {
      firstName: { label: "First name", groups: ["identity"] },
      email: { label: "Email", groups: ["contact"] },
    },
    groupOption: {
      itemGroups: [
        {
          group: "identity",
          title: "Identity",
          order: 1,
          onNextStep: async ({ form }) => {
            await onNextStep?.()
            return form as FormWithStepsBuild
          },
        },
        { group: "contact", title: "Contact", order: 2 },
      ],
    },
  })
  const formContext = useForm({ form, data: { firstName: "Alice" } })
  return <FormElement {...formContext} />
}

describe("step form navigation", () => {
  it("keeps the form mounted and shows a loader on Next while a step hook runs", async () => {
    let release: () => void = () => {}
    const pending = new Promise<void>((resolve) => (release = resolve))
    render(<StepForm onNextStep={() => pending} />)

    const input = screen.getByDisplayValue("Alice")
    const next = screen.getByRole("button", { name: /Continuer/ })
    fireEvent.click(next)

    await waitFor(() => expect(next).toBeDisabled())
    expect(next).toHaveAttribute("aria-busy", "true")
    // Same DOM node: the form was not unmounted, the typed value is still there.
    expect(screen.getByDisplayValue("Alice")).toBe(input)
    expect(input).toBeInTheDocument()

    release()
    await waitFor(() => expect(screen.getByText("Contact")).toBeInTheDocument())
  })

  it("moves to the next step without unmounting the form when validation is synchronous", async () => {
    render(<StepForm />)
    fireEvent.click(screen.getByRole("button", { name: /Continuer/ }))

    await waitFor(() => expect(screen.getByText("Contact")).toBeInTheDocument())
    expect(screen.queryByText("Step 1 of 2")).not.toBeInTheDocument()
  })
})
