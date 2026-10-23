import { describe, expect, it } from "vitest"
import { act, render } from "@testing-library/react"
import FormElement from "@/form/component/form/FormElement"
import useForm, { FormContextOutput } from "@/form/hook/useForm"

let formContext: FormContextOutput

function TestForm() {
  formContext = useForm({
    form: { inputs: { name: {}, email: {} } },
    data: { name: "Alice", email: "alice@test.fr" },
  })
  return <FormElement {...formContext} />
}

const getInput = (container: HTMLElement, name: string) =>
  container.querySelector<HTMLInputElement>(`input[name="${name}"]`)!

describe("updateData in FormElement", () => {
  it("does not mount again the field that has the focus", () => {
    const { container } = render(<TestForm />)
    const name = getInput(container, "name")
    name.focus()

    act(() => {
      formContext.updateData({ email: "bob@test.fr" })
    })

    expect(getInput(container, "name")).toBe(name)
    expect(document.activeElement).toBe(name)
    expect(getInput(container, "email").value).toBe("bob@test.fr")
  })

  it("shows a value changed from outside, even in a field read on mount", () => {
    const { container } = render(<TestForm />)

    act(() => {
      formContext.updateData({ name: "Bob" })
    })

    expect(getInput(container, "name").value).toBe("Bob")
  })
})
