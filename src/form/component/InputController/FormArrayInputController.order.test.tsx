import { describe, expect, it, onTestFinished, vi } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"
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
    order: { type: "hidden" },
    data: { label: "Block body" },
  },
}

const emptyContext = { form: {} } as FormContextInterface

const renderController = (
  value: object[] = [
    { id: "1", order: 0, data: "First" },
    { id: "2", order: 1, data: "Second" },
    { id: "3", order: 2, data: "Third" },
  ],
  options: Omit<MultiFormInputPropsInterface, "controller"> = {}
) => {
  const onChange = vi.fn()
  const formInput = {
    ...createFormArrayInputController(options),
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

/** Ids in the order the value puts them, which must be 0, 1, 2… */
const orderOf = (value: { id: string; order: number }[]) => {
  const sorted = [...value].sort((a, b) => a.order - b.order)
  expect(sorted.map((item) => item.order)).toEqual(sorted.map((_, index) => index))
  return sorted.map((item) => item.id)
}

const shownOrder = () =>
  screen
    .getAllByLabelText("Block body")
    .map((input) => (input as HTMLInputElement).value)

describe("FormArrayInputController, reordering blocks", () => {
  it("moves a block up and down from the header buttons", async () => {
    const user = userEvent.setup()
    const { onChange } = renderController()

    await user.click(screen.getAllByRole("button", { name: "Move up" })[1])

    expect(orderOf(lastValue(onChange))).toEqual(["2", "1", "3"])
    expect(shownOrder()).toEqual(["Second", "First", "Third"])

    await user.click(screen.getAllByRole("button", { name: "Move down" })[1])

    expect(orderOf(lastValue(onChange))).toEqual(["2", "3", "1"])
    expect(shownOrder()).toEqual(["Second", "Third", "First"])
  })

  it("disables moving the first block up and the last one down", () => {
    renderController()

    const up = screen.getAllByRole("button", { name: "Move up" })
    const down = screen.getAllByRole("button", { name: "Move down" })

    expect(up[0]).toBeDisabled()
    expect(up[1]).toBeEnabled()
    expect(down[1]).toBeEnabled()
    expect(down[2]).toBeDisabled()
  })

  it("keeps the focus on the moved block, on the other button at an end", async () => {
    const user = userEvent.setup()
    renderController()

    await user.click(screen.getAllByRole("button", { name: "Move up" })[1])

    // The block is now first: its "Move up" is disabled, "Move down" takes over.
    expect(screen.getAllByRole("button", { name: "Move down" })[0]).toHaveFocus()
  })

  it("reindexes an order holding gaps and duplicates", async () => {
    const user = userEvent.setup()
    const { onChange } = renderController([
      { id: "1", order: 3, data: "First" },
      { id: "2", order: 3, data: "Second" },
      { id: "3", order: 10, data: "Third" },
    ])

    await user.click(screen.getAllByRole("button", { name: "Move down" })[0])

    const value = lastValue(onChange)
    expect(orderOf(value)).toEqual(["2", "1", "3"])
    expect(new Set(value.map((item: { order: number }) => item.order)).size).toBe(3)
  })

  it("moves a block from its handle with the arrow keys", async () => {
    const user = userEvent.setup()
    const { onChange } = renderController(undefined, { draggable: true })

    const handle = screen.getAllByRole("button", { name: "Drag" })[0]
    handle.focus()
    await user.keyboard("{ArrowDown}")

    expect(orderOf(lastValue(onChange))).toEqual(["2", "1", "3"])
    // The handle keeps the focus, so the block can go on moving.
    expect(screen.getAllByRole("button", { name: "Drag" })[1]).toHaveFocus()

    await user.keyboard("{ArrowDown}")

    expect(orderOf(lastValue(onChange))).toEqual(["2", "3", "1"])

    await user.keyboard("{ArrowUp}")

    expect(orderOf(lastValue(onChange))).toEqual(["2", "1", "3"])
  })

  it("moves a block to the order typed in its header, without duplicate", async () => {
    const user = userEvent.setup()
    const { onChange } = renderController()

    const orderInput = screen.getAllByLabelText("Order")[2].querySelector("input")!
    await user.clear(orderInput)
    await user.type(orderInput, "0{Enter}")

    expect(orderOf(lastValue(onChange))).toEqual(["3", "1", "2"])
    expect(shownOrder()).toEqual(["Third", "First", "Second"])
  })

  it("does not move a block while its order is being typed", async () => {
    const user = userEvent.setup()
    const { onChange } = renderController()

    const orderInput = screen.getAllByLabelText("Order")[0].querySelector("input")!
    await user.clear(orderInput)
    await user.type(orderInput, "2")

    expect(onChange).not.toHaveBeenCalled()

    await user.tab()

    expect(orderOf(lastValue(onChange))).toEqual(["2", "3", "1"])
  })

  it("moves a block by touch, dropping it on the block under the finger", () => {
    const { onChange } = renderController(undefined, { draggable: true })

    const blocks = document.querySelectorAll("[data-block-index]")
    const elementFromPoint = vi.fn(() => blocks[2])
    const original = document.elementFromPoint
    document.elementFromPoint = elementFromPoint
    onTestFinished(() => {
      document.elementFromPoint = original
    })

    const handle = screen.getAllByRole("button", { name: "Drag" })[0]
    fireEvent.pointerDown(handle, { pointerType: "touch", pointerId: 1 })
    fireEvent.pointerMove(handle, { pointerType: "touch", pointerId: 1 })
    fireEvent.pointerUp(handle, { pointerType: "touch", pointerId: 1 })

    expect(elementFromPoint).toHaveBeenCalled()
    expect(orderOf(lastValue(onChange))).toEqual(["2", "3", "1"])
  })
})
