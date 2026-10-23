import { describe, expect, it, vi } from "vitest"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import FormElement from "@/form/component/form/FormElement"
import useForm from "@/form/hook/useForm"

interface Customer {
  type?: string
  company?: string
  vat?: string
}

function CustomerForm({ onSubmit }: { onSubmit: (data: Customer) => void }) {
  const formContext = useForm<Customer>({
    form: {
      label: { submit: "Send" },
      inputs: {
        type: { label: "Type", defaultValue: "private" },
        company: {
          label: "Company",
          required: true,
          validator: (value) => {
            if (!value) throw new Error("The company is missing")
          },
          hidden: (data) => data.type !== "pro",
        },
        vat: {
          label: "VAT",
          hidden: (data) => data.type !== "pro",
          keepHiddenValue: true,
        },
      },
    },
    data: { company: "Acme", vat: "FR01" },
    onSubmit,
  })
  return <FormElement {...formContext} />
}

const isHidden = (label: string) =>
  !!screen.getByLabelText(new RegExp(label)).closest(".hidden")

describe("inputs hidden by the data in FormElement", () => {
  it("shows or hides an input as the data changes", () => {
    render(<CustomerForm onSubmit={vi.fn()} />)

    expect(isHidden("Company")).toBe(true)

    fireEvent.change(screen.getByLabelText(/Type/), { target: { value: "pro" } })
    expect(isHidden("Company")).toBe(false)

    fireEvent.change(screen.getByLabelText(/Type/), { target: { value: "private" } })
    expect(isHidden("Company")).toBe(true)
  })

  it("does not validate a hidden input, and leaves its value out of the data", async () => {
    const onSubmit = vi.fn()
    render(<CustomerForm onSubmit={onSubmit} />)

    fireEvent.change(screen.getByLabelText(/Company/), { target: { value: "" } })
    fireEvent.click(screen.getByRole("button", { name: "Send" }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    // keepHiddenValue keeps the value of vat
    expect(onSubmit).toHaveBeenCalledWith({ type: "private", vat: "FR01" })
    expect(screen.queryByText("The company is missing")).toBeNull()
  })

  it("validates the input once it is shown", async () => {
    const onSubmit = vi.fn()
    render(<CustomerForm onSubmit={onSubmit} />)

    fireEvent.change(screen.getByLabelText(/Type/), { target: { value: "pro" } })
    fireEvent.change(screen.getByLabelText(/Company/), { target: { value: "" } })
    fireEvent.click(screen.getByRole("button", { name: "Send" }))

    await waitFor(() =>
      expect(screen.getByText("This field is required")).toBeTruthy()
    )
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
