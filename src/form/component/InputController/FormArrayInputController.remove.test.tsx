import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import {
  FormArrayInputController,
  MultiFormInputPropsInterface,
  createFormArrayInputController,
} from "@/form/component/InputController/FormArrayInputController"
import FormProvider from "@/form/provider/FormProvider"
import { FormContextInterface } from "@/form/provider/FormContext"

const blockForm = {
  inputs: {
    title: { label: "Title" },
  },
}

const emptyContext = { form: {} } as FormContextInterface

const renderController = (value: object[]) => {
  const onChange = vi.fn()
  const formInput = {
    ...createFormArrayInputController(),
    id: "blocks",
    form: blockForm,
    value,
  } as MultiFormInputPropsInterface

  render(
    <FormProvider formContext={emptyContext}>
      <FormArrayInputController formInput={formInput} onChange={onChange} />
    </FormProvider>
  )

  return { onChange }
}

const lastValue = (onChange: ReturnType<typeof vi.fn>) =>
  onChange.mock.lastCall?.[0].value

describe("FormArrayInputController, removing a block", () => {
  it("removes a block identified by id", async () => {
    const user = userEvent.setup()
    const { onChange } = renderController([
      { id: "1", title: "one" },
      { id: "2", title: "two" },
    ])

    await user.click(screen.getAllByLabelText("remove")[0])

    expect(lastValue(onChange)).toEqual([{ id: "2", title: "two" }])
    expect(screen.getAllByLabelText("remove")).toHaveLength(1)
  })

  it("removes a JSON-LD block that only carries @id", async () => {
    const user = userEvent.setup()
    const { onChange } = renderController([
      { "@id": "/api/blocks/1", title: "one" },
      { "@id": "/api/blocks/2", title: "two" },
    ])

    await user.click(screen.getAllByLabelText("remove")[0])

    expect(lastValue(onChange)).toEqual([{ "@id": "/api/blocks/2", title: "two" }])
    expect(screen.getAllByLabelText("remove")).toHaveLength(1)
  })

  it("removes a block without any identifier, such as the initial blank one", async () => {
    const user = userEvent.setup()
    const { onChange } = renderController([{ title: "one" }, { title: "two" }])

    await user.click(screen.getAllByLabelText("remove")[1])

    expect(lastValue(onChange)).toEqual([{ title: "one" }])
    expect(screen.getAllByLabelText("remove")).toHaveLength(1)
  })
})
