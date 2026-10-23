import { describe, expect, it, vi } from "vitest"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import FormElement from "@/form/component/form/FormElement"
import useForm from "@/form/hook/useForm"
import { FormInterface } from "@/form/FormInterface"
import { createFormArrayInputController } from "@/form/component/InputController/FormArrayInputController"

const streetRequired = (value: unknown) => {
  if (!value) throw new Error("street required")
  return value
}

const addressForm: FormInterface = {
  inputs: { street: { label: "Street", validator: streetRequired } },
}

function ParentForm({
  form,
  data,
  onSubmit,
}: {
  form: FormInterface
  data: any
  onSubmit: (data: any) => void
}) {
  const formContext = useForm({
    form: { label: { submit: "Send" }, ...form },
    data,
    onSubmit,
  })
  return <FormElement {...formContext} />
}

const send = () => fireEvent.click(screen.getByRole("button", { name: "Send" }))

describe("sub-forms in FormElement", () => {
  it("runs the validators of a sub-form and blocks the parent submission", async () => {
    const onSubmit = vi.fn()
    render(
      <ParentForm
        form={{ inputs: { address: { form: addressForm } } }}
        data={{ address: {} }}
        onSubmit={onSubmit}
      />
    )

    send()

    await waitFor(() =>
      expect(screen.getByText("street required")).toBeInTheDocument()
    )
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("submits once the sub-form is valid", async () => {
    const onSubmit = vi.fn()
    render(
      <ParentForm
        form={{ inputs: { address: { form: addressForm } } }}
        data={{ address: { street: "Main street" } }}
        onSubmit={onSubmit}
      />
    )

    send()

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(screen.queryByText("street required")).not.toBeInTheDocument()
  })

  it("renders a sub-form as a container, not as a nested <form>", () => {
    const { container } = render(
      <ParentForm
        form={{ inputs: { address: { form: addressForm } } }}
        data={{ address: {} }}
        onSubmit={vi.fn()}
      />
    )

    expect(container.querySelectorAll("form")).toHaveLength(1)
    expect(container.querySelector("form form")).toBeNull()
    expect(container.querySelector("form fieldset")).not.toBeNull()
  })

  it("validates every block of a form array", async () => {
    const onSubmit = vi.fn()
    render(
      <ParentForm
        form={{
          inputs: {
            addresses: createFormArrayInputController({ form: addressForm }),
          },
        }}
        data={{
          addresses: [
            { id: "1", order: 0, street: "Main street" },
            { id: "2", order: 1 },
          ],
        }}
        onSubmit={onSubmit}
      />
    )

    send()

    await waitFor(() =>
      expect(screen.getAllByText("street required")).toHaveLength(1)
    )
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("opens a folded invalid block and shows its violation", async () => {
    const onSubmit = vi.fn()
    render(
      <ParentForm
        form={{
          inputs: {
            addresses: createFormArrayInputController({
              form: addressForm,
              closedByDefault: true,
            }),
          },
        }}
        data={{
          addresses: [
            { id: "1", order: 0, street: "Main street" },
            { id: "2", order: 1 },
          ],
        }}
        onSubmit={onSubmit}
      />
    )

    expect(screen.queryByLabelText("Street")).not.toBeInTheDocument()

    send()

    await waitFor(() =>
      expect(screen.getByText("street required")).toBeInTheDocument()
    )
    // Only the invalid block opens.
    expect(screen.getAllByLabelText("Street")).toHaveLength(1)
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
