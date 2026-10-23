import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import FormElement from "@/form/component/form/FormElement"
import { FormInterface } from "@/form/FormInterface"
import useForm from "@/form/hook/useForm"

function NameForm({ form, data }: { form?: FormInterface; data?: object }) {
  const formContext = useForm({
    form: { inputs: { name: { label: "Name" } }, ...form },
    data,
  })
  return <FormElement {...formContext} />
}

describe("DefaultFormSubmitAction", () => {
  it("reads Create on a new item, rather than the raw action", () => {
    render(<NameForm data={{}} />)
    expect(screen.getByRole("button", { name: "Create" })).toBeInTheDocument()
  })

  it("reads Save on an existing item", () => {
    render(<NameForm data={{ id: 1, name: "Alice" }} />)
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument()
  })

  it("keeps label.submit when one is given", () => {
    render(<NameForm form={{ label: { submit: "Send" } }} data={{ id: 1 }} />)
    expect(screen.getByRole("button", { name: "Send" })).toBeInTheDocument()
  })
})
