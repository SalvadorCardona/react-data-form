import { describe, expect, it, vi } from "vitest"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import {
  FormArrayInputController,
  MultiFormInputPropsInterface,
  createFormArrayInputController,
} from "@/form/component/InputController/FormArrayInputController"
import FormProvider from "@/form/provider/FormProvider"
import { FormContextInterface } from "@/form/provider/FormContext"
import FormElement from "@/form/component/form/FormElement"
import useForm from "@/form/hook/useForm"
import { FormInterface } from "@/form/FormInterface"

const blockForm = {
  inputs: {
    title: { label: "Title" },
  },
}

const emptyContext = { form: {} } as FormContextInterface

const buildInput = (
  value: object[] | undefined,
  options: Omit<MultiFormInputPropsInterface, "controller"> = {}
) =>
  ({
    ...createFormArrayInputController(options),
    id: "blocks",
    form: blockForm,
    value,
  }) as MultiFormInputPropsInterface

const renderController = (
  value: object[] | undefined,
  options: Omit<MultiFormInputPropsInterface, "controller"> = {}
) => {
  const onChange = vi.fn()
  const view = render(
    <FormProvider formContext={emptyContext}>
      <FormArrayInputController
        formInput={buildInput(value, options)}
        onChange={onChange}
      />
    </FormProvider>
  )

  const rerenderWith = (newValue: object[] | undefined) =>
    view.rerender(
      <FormProvider formContext={emptyContext}>
        <FormArrayInputController
          formInput={buildInput(newValue, options)}
          onChange={onChange}
        />
      </FormProvider>
    )

  return { onChange, rerenderWith }
}

const lastValue = (onChange: ReturnType<typeof vi.fn>) =>
  onChange.mock.lastCall?.[0].value

const addButton = () => screen.getByRole("button", { name: /form.array.add/ })

describe("FormArrayInputController, value", () => {
  it("renders no block when the value is empty", () => {
    renderController(undefined)

    expect(screen.queryAllByLabelText("remove")).toHaveLength(0)
  })

  it("adds only the new block to an empty value", async () => {
    const user = userEvent.setup()
    const { onChange } = renderController(undefined)

    await user.click(addButton())

    expect(lastValue(onChange)).toEqual([{ id: expect.any(String) }])
    expect(screen.getAllByLabelText("remove")).toHaveLength(1)
  })

  it("follows a value changed from outside", () => {
    const { rerenderWith } = renderController(undefined)

    rerenderWith([
      { id: "1", title: "one" },
      { id: "2", title: "two" },
    ])
    expect(screen.getAllByLabelText("remove")).toHaveLength(2)

    rerenderWith(undefined)
    expect(screen.queryAllByLabelText("remove")).toHaveLength(0)
  })

  it("lets blocks be added below min", async () => {
    const user = userEvent.setup()
    const { onChange } = renderController(undefined, { min: 2 })

    await user.click(addButton())
    await user.click(addButton())

    expect(lastValue(onChange)).toHaveLength(2)
  })

  it("refuses to add a block past max", async () => {
    const user = userEvent.setup()
    const { onChange } = renderController([{ id: "1" }, { id: "2" }], { max: 2 })

    await user.click(addButton())

    expect(onChange).not.toHaveBeenCalled()
    expect(
      screen.getByText("This collection should contain 2 elements or less.")
    ).toBeInTheDocument()
  })
})

function ParentForm({
  form,
  data,
  onSubmit,
}: {
  form: FormInterface
  data: any
  onSubmit: (data: any) => void
}) {
  const formContext = useForm({
    form: { label: { submit: "Send" }, ...form },
    data,
    onSubmit,
  })
  return <FormElement {...formContext} />
}

const send = () => fireEvent.click(screen.getByRole("button", { name: "Send" }))

describe("FormArrayInputController, min", () => {
  it("raises a violation on submission below min", async () => {
    const onSubmit = vi.fn()
    render(
      <ParentForm
        form={{
          inputs: {
            blocks: createFormArrayInputController({ form: blockForm, min: 2 }),
          },
        }}
        data={{ blocks: [{ id: "1", title: "one" }] }}
        onSubmit={onSubmit}
      />
    )

    send()

    await waitFor(() =>
      expect(
        screen.getByText("This collection should contain 2 elements or more.")
      ).toBeInTheDocument()
    )
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("submits once min is reached", async () => {
    const onSubmit = vi.fn()
    render(
      <ParentForm
        form={{
          inputs: {
            blocks: createFormArrayInputController({
              form: blockForm,
              min: 2,
              validator: (value) => value,
            }),
          },
        }}
        data={{
          blocks: [
            { id: "1", title: "one" },
            { id: "2", title: "two" },
          ],
        }}
        onSubmit={onSubmit}
      />
    )

    send()

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
  })
})
