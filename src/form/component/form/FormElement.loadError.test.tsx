import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import FormElement from "@/form/component/form/FormElement"
import useForm from "@/form/hook/useForm"

function FailingForm() {
  const formContext = useForm({
    form: { label: { submit: "Send" }, inputs: { name: { label: "Name" } } },
    asyncData: (): Promise<{ name: string }> => Promise.reject(new Error("404")),
  })
  return <FormElement {...formContext} />
}

describe("FormElement when the data fails to load", () => {
  it("replaces the loader with the load error, without the inputs", async () => {
    render(<FailingForm />)

    expect(await screen.findByText("Unable to load the data")).toBeDefined()
    expect(screen.queryByRole("button", { name: "Send" })).toBeNull()
    expect(screen.queryByLabelText("Name")).toBeNull()
  })
})
