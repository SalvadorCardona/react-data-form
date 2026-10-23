import { beforeAll, describe, expect, it } from "vitest"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import FormElement from "@/form/component/form/FormElement"
import useForm from "@/form/hook/useForm"
import { createStepForm } from "@/step/FormStep"

// framer-motion reads the preference once per module, hence a dedicated file.
beforeAll(() => {
  window.matchMedia = (query: string) =>
    ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList
})

function StepForm() {
  const form = createStepForm({
    inputs: {
      firstName: { label: "First name", groups: ["identity"] },
      email: { label: "Email", groups: ["contact"] },
    },
    groupOption: {
      itemGroups: [
        { group: "identity", title: "Identity", order: 1 },
        { group: "contact", title: "Contact", order: 2 },
      ],
    },
  })
  const formContext = useForm({ form, data: { firstName: "Alice" } })
  return <FormElement {...formContext} />
}

describe("FormStepDecorator and prefers-reduced-motion", () => {
  it("switches steps without sliding or fading the content", async () => {
    render(<StepForm />)
    fireEvent.click(screen.getByRole("button", { name: /Next/ }))

    await waitFor(() => expect(screen.getByLabelText(/Email/)).toBeInTheDocument())
    const step = screen.getByLabelText(/Email/).closest("[style]")
    expect(step?.getAttribute("style") ?? "").not.toMatch(/transform|opacity/)
  })
})
