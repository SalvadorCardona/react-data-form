import { describe, expect, it, vi } from "vitest"
import { render } from "@testing-library/react"
import FormElement from "@/form/component/form/FormElement"
import useForm from "@/form/hook/useForm"
import { WysiwygInputController } from "@/form/component/InputController/WysiwygInputController"
import { FormInputInterface } from "@/form/FormInputInterface"
import { ActionList } from "@/internal/action/ActionList"

function ReadForm({ value }: { value: string }) {
  const formContext = useForm({
    form: {
      action: ActionList.read,
      inputs: {
        description: { label: "Description", controller: WysiwygInputController },
      },
    },
    data: { description: value },
  })
  return <FormElement {...formContext} />
}

describe("WysiwygInputController in read mode", () => {
  it("sanitizes the value of a read form", () => {
    const { container } = render(
      <ReadForm value={'<p>Hello</p><img src="x" onerror="alert(1)">'} />
    )

    const img = container.querySelector("img")!
    expect(img).not.toBeNull()
    expect(img.hasAttribute("onerror")).toBe(false)
    expect(container.textContent).toContain("Hello")
  })

  it("sanitizes the value of a readonly input", () => {
    const { container } = render(
      <WysiwygInputController
        formInput={
          {
            name: "description",
            readonly: true,
            value:
              '<script>alert(1)</script><a href="javascript:alert(1)">a</a>' +
              '<a href="data:text/html,<script>alert(1)</script>">b</a>',
          } as FormInputInterface
        }
        onChange={vi.fn()}
      />
    )

    expect(container.querySelector("script")).toBeNull()
    for (const link of container.querySelectorAll("a")) {
      expect(link.hasAttribute("href")).toBe(false)
    }
  })
})
