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
    order: { type: "hidden" },
    data: { label: "Block body" },
  },
}

/**
 * The controller reads the parent form from the context — a bare one is enough,
 * the blocks are rendered from `form`, not from an action.
 */
const emptyContext = { form: {} } as FormContextInterface

const renderController = (
  options: Omit<MultiFormInputPropsInterface, "controller"> = {},
  onChange = vi.fn()
) => {
  const formInput = {
    ...createFormArrayInputController(options),
    id: "blocks",
    form: blockForm,
    value: [
      { id: "1", order: 0, data: "First" },
      { id: "2", order: 1, data: "Second" },
    ],
  } as MultiFormInputPropsInterface

  render(
    <FormProvider formContext={emptyContext}>
      <FormArrayInputController formInput={formInput} onChange={onChange} />
    </FormProvider>
  )

  return { onChange }
}

const toggles = () =>
  screen
    .getAllByRole("button")
    .filter((button) => button.hasAttribute("aria-expanded"))

describe("FormArrayInputController, collapsing a block", () => {
  it("shows the block body, hides it on click and brings it back on the next one", async () => {
    const user = userEvent.setup()
    renderController()

    expect(screen.getAllByLabelText("Block body")).toHaveLength(2)
    expect(toggles()[0]).toHaveAttribute("aria-expanded", "true")

    await user.click(toggles()[0])

    // Only the first block folded: its header stays, its body is gone.
    expect(screen.getAllByLabelText("Block body")).toHaveLength(1)
    expect(toggles()[0]).toHaveAttribute("aria-expanded", "false")
    expect(screen.getAllByLabelText("order")).toHaveLength(2)

    await user.click(toggles()[0])

    expect(screen.getAllByLabelText("Block body")).toHaveLength(2)
    expect(toggles()[0]).toHaveAttribute("aria-expanded", "true")
  })

  it("keeps the drag handle and the order input on a folded block", async () => {
    const user = userEvent.setup()
    renderController({ draggable: true })

    await user.click(toggles()[0])

    expect(screen.getAllByLabelText("drag")).toHaveLength(2)

    const orderInput = screen.getAllByLabelText("order")[0].querySelector("input")
    expect(orderInput).toHaveValue(0)
  })

  it("folds from the keyboard too", async () => {
    const user = userEvent.setup()
    renderController()

    toggles()[0].focus()
    await user.keyboard("{Enter}")

    expect(screen.getAllByLabelText("Block body")).toHaveLength(1)
    expect(toggles()[0]).toHaveAttribute("aria-expanded", "false")
  })

  it("mounts every existing block folded with closedByDefault", () => {
    renderController({ closedByDefault: true })

    expect(screen.queryByLabelText("Block body")).not.toBeInTheDocument()
    for (const toggle of toggles()) {
      expect(toggle).toHaveAttribute("aria-expanded", "false")
    }
  })

  it("never pushes the open state into the value", async () => {
    const user = userEvent.setup()
    const { onChange } = renderController()

    await user.click(toggles()[0])
    await user.click(toggles()[0])

    expect(onChange).not.toHaveBeenCalled()
  })

  it("opens a block added after mount, even with closedByDefault", async () => {
    const user = userEvent.setup()
    renderController({ closedByDefault: true })

    await user.click(screen.getByRole("button", { name: /form.array.add/ }))

    // The two initial blocks stay folded, the new one shows its body.
    expect(screen.getAllByLabelText("Block body")).toHaveLength(1)
    expect(
      toggles().filter((t) => t.getAttribute("aria-expanded") === "true")
    ).toHaveLength(1)
  })
})
