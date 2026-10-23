import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import {
  IaImageInputController,
  IaImageInputControllerInterface,
} from "./IaImageInputController"

const formInput = {
  name: "receipt",
  label: "Receipt",
  value: "data:image/png;base64,iVBORw0KGgo=",
} as IaImageInputControllerInterface

describe("IaImageInputController", () => {
  it("removes the image through a named button", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<IaImageInputController formInput={formInput} onChange={onChange} />)

    await user.click(screen.getByRole("button", { name: "Remove the image" }))

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ value: null }))
  })
})
