import { describe, expect, it, vi } from "vitest"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import FormElement from "@/form/component/form/FormElement"
import useForm from "@/form/hook/useForm"
import { SelectInputController } from "@/form/component/InputController/SelectInputController"

function RequiredForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const formContext = useForm({
    form: {
      label: { submit: "Send" },
      inputs: {
        name: { label: "Name", required: true },
        country: {
          label: "Country",
          required: true,
          controller: SelectInputController,
          valueOptions: [{ label: "France", value: "fr" }],
        },
      },
    },
    onSubmit,
  })
  return <FormElement {...formContext} />
}

describe("required inputs in FormElement", () => {
  it("shows a violation under each empty required input and does not submit", async () => {
    const onSubmit = vi.fn()
    render(<RequiredForm onSubmit={onSubmit} />)

    fireEvent.click(screen.getByRole("button", { name: "Send" }))

    await waitFor(() =>
      expect(screen.getAllByText("This field is required")).toHaveLength(2)
    )
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
