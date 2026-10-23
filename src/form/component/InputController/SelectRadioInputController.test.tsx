import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { FC, useState } from "react"
import { SelectRadioInputController } from "@/form/component/InputController/SelectRadioInputController"
import { SelectCardInputController } from "@/form/component/InputController/SelectCardInputController"
import { SelectButtonInputController } from "@/form/component/InputController/SelectButtonInputController"
import { SelectFormInputInterface } from "@/form/component/InputController/SelectInputController"
import { InputControllerInterface } from "@/form/InputControllerInterface"

const options = [
  { label: "Yes", value: "yes" },
  { label: "No", value: "no" },
  { label: "Maybe", value: "maybe" },
]

function Harness({
  controller: Controller,
  name = "answer",
  initial,
}: {
  controller: FC<InputControllerInterface<SelectFormInputInterface>>
  name?: string
  initial?: unknown
}) {
  const [value, setValue] = useState<unknown>(initial)
  const formInput = { name, label: name, valueOptions: options, value }

  return (
    <div>
      <Controller
        formInput={formInput}
        onChange={(input) => setValue(input.value)}
      />
      <output data-testid={`${name}-value`}>{JSON.stringify(value)}</output>
    </div>
  )
}

let consoleError: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  consoleError = vi.spyOn(console, "error").mockImplementation(() => {})
})

afterEach(() => {
  consoleError.mockRestore()
})

describe("SelectRadioInputController", () => {
  it("keeps the focus on the clicked radio and logs no error", async () => {
    const user = userEvent.setup()
    render(<Harness controller={SelectRadioInputController} />)

    await user.click(screen.getByRole("radio", { name: "Yes" }))

    expect(screen.getByTestId("answer-value").textContent).toBe('"yes"')
    expect(document.activeElement).toBe(screen.getByRole("radio", { name: "Yes" }))
    expect(screen.getByRole("radio", { name: "Yes" })).toHaveAttribute(
      "aria-checked",
      "true"
    )
    expect(consoleError).not.toHaveBeenCalled()
  })

  it("does not mutate the formInput it receives", () => {
    const formInput = { name: "answer", valueOptions: options }
    render(<SelectRadioInputController formInput={formInput} onChange={() => {}} />)

    expect(formInput).not.toHaveProperty("itemComponent")
    expect(formInput).not.toHaveProperty("decoratorComponent")
  })

  it("renders an accessible radio group with unique ids", () => {
    render(
      <>
        <Harness controller={SelectRadioInputController} name="first" />
        <Harness controller={SelectRadioInputController} name="second" />
      </>
    )

    expect(screen.getAllByRole("radiogroup")).toHaveLength(2)
    const ids = screen.getAllByRole("radio").map((radio) => radio.id)
    expect(new Set(ids).size).toBe(ids.length)
    // Each radio is named by its own label
    expect(screen.getAllByRole("radio", { name: "Yes" })).toHaveLength(2)
  })

  it("moves the selection and the focus with the arrow keys", async () => {
    const user = userEvent.setup()
    render(<Harness controller={SelectRadioInputController} initial={"yes"} />)

    await user.tab()
    expect(document.activeElement).toBe(screen.getByRole("radio", { name: "Yes" }))

    await user.keyboard("{ArrowDown}")
    expect(screen.getByTestId("answer-value").textContent).toBe('"no"')
    expect(document.activeElement).toBe(screen.getByRole("radio", { name: "No" }))

    await user.keyboard("{ArrowUp}{ArrowUp}")
    expect(screen.getByTestId("answer-value").textContent).toBe('"maybe"')
    expect(document.activeElement).toBe(screen.getByRole("radio", { name: "Maybe" }))
  })

  it("selects with the space key without losing the focus", async () => {
    const user = userEvent.setup()
    render(<Harness controller={SelectRadioInputController} />)

    await user.tab()
    await user.keyboard(" ")

    expect(screen.getByTestId("answer-value").textContent).toBe('"yes"')
    expect(document.activeElement).toBe(screen.getByRole("radio", { name: "Yes" }))
  })
})

describe.each([
  ["SelectCardInputController", SelectCardInputController],
  ["SelectButtonInputController", SelectButtonInputController],
])("%s", (_, Controller) => {
  it("keeps the focus on the clicked option", async () => {
    const user = userEvent.setup()
    render(<Harness controller={Controller} />)

    await user.click(screen.getByRole("button", { name: "No" }))

    expect(screen.getByTestId("answer-value").textContent).toBe('"no"')
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "No" }))
    expect(consoleError).not.toHaveBeenCalled()
  })

  it("does not mutate the formInput it receives", () => {
    const formInput = { name: "answer", valueOptions: options }
    render(<Controller formInput={formInput} onChange={() => {}} />)

    expect(formInput).not.toHaveProperty("itemComponent")
    expect(formInput).not.toHaveProperty("decoratorComponent")
  })
})
