import { describe, expect, it } from "vitest"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import FormElement from "@/form/component/form/FormElement"
import useForm from "@/form/hook/useForm"

function FailingForm() {
  const formContext = useForm({
    form: { inputs: { name: { label: "Name" } } },
    data: { name: "Alice" },
    onSubmit: async () => {
      throw new Error("500")
    },
  })
  return <FormElement {...formContext} />
}

describe("FormElement submit", () => {
  it("shows the form again with its values when onSubmit rejects", async () => {
    render(<FailingForm />)

    fireEvent.click(screen.getByRole("button"))

    await waitFor(() =>
      expect(screen.getByDisplayValue("Alice")).toBeInTheDocument()
    )
    expect(screen.getByRole("button")).toBeEnabled()
  })
})
