import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import FormElement from "@/form/component/form/FormElement"
import useForm from "@/form/hook/useForm"
import { FormInterface } from "@/form/FormInterface"

function SubmitForm({
  form,
  data,
}: {
  form?: Partial<FormInterface>
  data?: Record<string, any>
}) {
  const formContext = useForm({
    form: {
      label: { submit: "Send", success: "Saved", error: "The form is invalid" },
      inputs: {
        first: { label: "First" },
        second: { label: "Second", required: true },
        third: { label: "Third", required: true },
      },
      ...form,
    },
    data,
  })
  return <FormElement {...formContext} />
}

describe("FormErrors after a submission", () => {
  const scrollIntoView = vi.fn()

  beforeEach(() => {
    Element.prototype.scrollIntoView = scrollIntoView
  })

  afterEach(() => {
    scrollIntoView.mockReset()
    delete (Element.prototype as Partial<Element>).scrollIntoView
  })

  it("shows label.error as an alert and focuses the first invalid field", async () => {
    render(<SubmitForm />)

    fireEvent.click(screen.getByRole("button", { name: "Send" }))

    expect(await screen.findByText("The form is invalid")).toHaveAttribute(
      "role",
      "alert"
    )
    const second = screen.getByLabelText(/Second/)
    await waitFor(() => expect(second).toHaveFocus())
    expect(scrollIntoView).toHaveBeenCalledWith({ block: "center" })
    expect(screen.getByRole("status")).toBeEmptyDOMElement()
  })

  it("focuses the first invalid field in display order, not declaration order", async () => {
    render(
      <SubmitForm
        form={{
          inputs: {
            third: { label: "Third", required: true },
            first: { label: "First" },
            second: { label: "Second", required: true },
          },
        }}
      />
    )

    fireEvent.click(screen.getByRole("button", { name: "Send" }))

    await waitFor(() => expect(screen.getByLabelText(/Third/)).toHaveFocus())
  })

  it("shows label.success in a polite live region once submitted", async () => {
    render(<SubmitForm data={{ second: "b", third: "c" }} />)

    const status = screen.getByRole("status")
    expect(status).toHaveAttribute("aria-live", "polite")
    expect(status).toBeEmptyDOMElement()

    fireEvent.click(screen.getByRole("button", { name: "Send" }))

    await waitFor(() => expect(status).toHaveTextContent("Saved"))
    expect(screen.queryByText("The form is invalid")).not.toBeInTheDocument()

    // The message no longer holds once a value changes
    fireEvent.change(screen.getByLabelText(/First/), { target: { value: "a" } })
    await waitFor(() => expect(status).toBeEmptyDOMElement())
  })

  it("does not show label.success with showSuccess: false", async () => {
    render(
      <SubmitForm form={{ showSuccess: false }} data={{ second: "b", third: "c" }} />
    )

    const submit = screen.getByRole("button", { name: "Send" })
    fireEvent.click(submit)

    await waitFor(() => expect(submit).not.toBeDisabled())
    expect(screen.getByRole("status")).toBeEmptyDOMElement()
    expect(screen.queryByText("Saved")).not.toBeInTheDocument()
  })

  it("clears label.error once a submission validates", async () => {
    render(<SubmitForm />)

    fireEvent.click(screen.getByRole("button", { name: "Send" }))
    await screen.findByText("The form is invalid")

    fireEvent.change(screen.getByLabelText(/Second/), { target: { value: "b" } })
    fireEvent.change(screen.getByLabelText(/Third/), { target: { value: "c" } })
    fireEvent.click(screen.getByRole("button", { name: "Send" }))

    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("Saved")
    )
    expect(screen.queryByText("The form is invalid")).not.toBeInTheDocument()
  })
})
