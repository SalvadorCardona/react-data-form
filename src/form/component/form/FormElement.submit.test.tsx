import { describe, expect, it } from "vitest"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import FormElement from "@/form/component/form/FormElement"
import useForm from "@/form/hook/useForm"

function SubmitForm({ onSubmit }: { onSubmit: () => Promise<void> }) {
  const formContext = useForm({
    form: {
      label: { submit: "Send" },
      inputs: { name: { label: "Name" } },
    },
    data: { name: "Alice" },
    onSubmit,
  })
  return <FormElement {...formContext} />
}

describe("FormElement submission", () => {
  it("keeps the form mounted and shows a loader on the submit button while submitting", async () => {
    let release: () => void = () => {}
    const pending = new Promise<void>((resolve) => (release = resolve))
    render(<SubmitForm onSubmit={() => pending} />)

    const input = screen.getByDisplayValue("Alice")
    const submit = screen.getByRole("button", { name: "Send" })
    fireEvent.click(submit)

    await waitFor(() => expect(submit).toBeDisabled())
    expect(submit).toHaveAttribute("aria-busy", "true")
    // Same DOM node: the form was not unmounted, the typed value is still there.
    expect(screen.getByDisplayValue("Alice")).toBe(input)
    expect(input).toBeInTheDocument()

    release()
    await waitFor(() => expect(submit).not.toBeDisabled())
    expect(submit).toHaveAttribute("aria-busy", "false")
    expect(screen.getByDisplayValue("Alice")).toBe(input)
  })
})
