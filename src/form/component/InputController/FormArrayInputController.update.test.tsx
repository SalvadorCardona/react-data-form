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

describe("FormArrayInputController, editing a block", () => {
  it("edits the displayed block when the array is not sorted by order", async () => {
    const user = userEvent.setup()
    const { onChange } = renderController([
      { id: "x", order: 2, title: "second" },
      { id: "y", order: 1, title: "first" },
    ])

    const [firstTitle] = screen.getAllByRole("textbox")
    expect(firstTitle).toHaveProperty("value", "first")
    await user.type(firstTitle, "!")

    expect(lastValue(onChange)).toEqual([
      { id: "x", order: 2, title: "second" },
      { id: "y", order: 1, title: "first!" },
    ])
  })

  it("edits a JSON-LD block that only carries @id", async () => {
    const user = userEvent.setup()
    const { onChange } = renderController([
      { "@id": "/api/blocks/2", order: 2, title: "second" },
      { "@id": "/api/blocks/1", order: 1, title: "first" },
    ])

    await user.type(screen.getAllByRole("textbox")[0], "!")

    expect(lastValue(onChange)).toEqual([
      { "@id": "/api/blocks/2", order: 2, title: "second" },
      { "@id": "/api/blocks/1", order: 1, title: "first!" },
    ])
  })

  it("edits the right block after its order changed through the header", async () => {
    const user = userEvent.setup()
    const { onChange } = renderController([
      { id: "x", order: 1, title: "one" },
      { id: "y", order: 2, title: "two" },
    ])

    // The order is committed on Enter, and the list is then reindexed from 0.
    const orderInput = screen.getAllByRole("spinbutton")[0]
    await user.clear(orderInput)
    await user.type(orderInput, "3{Enter}")

    const [firstTitle] = screen.getAllByRole("textbox")
    expect(firstTitle).toHaveProperty("value", "two")
    await user.type(firstTitle, "!")

    expect(lastValue(onChange)).toEqual([
      { id: "y", order: 0, title: "two!" },
      { id: "x", order: 1, title: "one" },
    ])
  })
})
