import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { act, cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as library from "react-data-form"
import {
  FormElement,
  type FormInputInterface,
  type FormInterface,
  useForm,
} from "react-data-form"
import * as media from "react-data-form/media"
import { MediaObjectProvider } from "react-data-form/media"
import { allDemos, mediaPort } from "./catalog"

/**
 * A read-only field must not let anything change on screen: the form refuses
 * the change, so a control that still moves shows a value that is not saved.
 * Every exported controller is rendered read-only, filled with its gallery
 * value, then every element a user could reach is clicked, typed into or given
 * a file; neither the page nor the form data may differ afterwards.
 */
const exportedControllers = Object.entries({ ...library, ...media })
  .filter(
    ([name, value]) =>
      /^[A-Z]\w*InputController$/.test(name) && typeof value === "function"
  )
  .map(([name]) => name)

/**
 * Controllers still changing on screen in read-only, left to tickets of their
 * own: each entry is to be removed by the ticket that fixes it.
 */
const pending = [
  "AutocompleteInputController",
  "FormInputController",
  "FormArrayInputController",
]

/** Extra fields and data a controller needs to have something to show. */
const fixtures: Record<
  string,
  { inputs: Record<string, FormInputInterface>; data: Record<string, unknown> }
> = {
  // The range lives in two other fields of the form.
  DateRangeInputController: {
    inputs: { startDate: { type: "hidden" }, endDate: { type: "hidden" } },
    data: {
      startDate: "2026-10-23T09:00:00.000Z",
      endDate: "2026-10-24T17:00:00.000Z",
    },
  },
}

function ReadonlyField({
  name,
  input,
  action,
}: {
  name: string
  input: FormInputInterface
  action?: "read"
}) {
  const fixture = fixtures[name]
  const form: FormInterface = {
    action,
    label: {},
    components: { formSubmitAction: () => null },
    inputs: { field: input, ...fixture?.inputs },
    onSubmit: (data) => data,
    // Clicking the hidden submit input sends the form: "Saved" is not a change
    // made by the field.
    showSuccess: false,
  }
  const formContext = useForm({ form, data: fixture?.data })

  return (
    <MediaObjectProvider port={mediaPort}>
      <FormElement {...formContext} />
      <output data-testid="data">{JSON.stringify(formContext.form.data)}</output>
    </MediaObjectProvider>
  )
}

const reachable = [
  "button",
  "input",
  "textarea",
  "select",
  "label",
  "a[href]",
  "[role]",
  "[tabindex]",
  "[contenteditable='true']",
].join(", ")

const typeable = (element: Element) =>
  (element instanceof HTMLInputElement &&
    !["checkbox", "radio", "file", "hidden"].includes(element.type)) ||
  element instanceof HTMLTextAreaElement ||
  (element as HTMLElement).isContentEditable

const describeElement = (element: Element) =>
  element.outerHTML.slice(0, 120).replace(/\s+/g, " ")

let consoleError: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  consoleError = vi.spyOn(console, "error").mockImplementation(() => {})
})

afterEach(() => {
  consoleError.mockRestore()
  cleanup()
})

describe("every exported controller in read-only", () => {
  it("has a gallery demo to be tested with", () => {
    const named = allDemos.map((demo) => demo.name)
    expect(exportedControllers.filter((name) => !named.includes(name))).toEqual([])
  })

  it("is shown read-only in the gallery unless still pending", () => {
    const hidden = allDemos.filter((demo) => demo.readonly === false)
    expect(hidden.map((demo) => demo.name).sort()).toEqual([...pending].sort())
  })

  for (const name of pending) it.todo(`${name} honours readonly`)

  const cases = allDemos
    .filter(
      (demo) =>
        exportedControllers.includes(demo.name) && !pending.includes(demo.name)
    )
    .flatMap((demo) => [
      { mode: "readonly: true", demo, action: undefined },
      { mode: 'action: "read"', demo, action: "read" as const },
    ])

  it.each(cases)(
    "$demo.name ($mode) shows no change and keeps its value",
    async ({ demo, action }) => {
      const user = userEvent.setup({ pointerEventsCheck: 0 })
      const input: FormInputInterface = {
        ...demo.input,
        value: demo.filled ?? demo.input.value,
        ...(action ? {} : { readonly: true }),
      }

      const { container } = render(
        <ReadonlyField name={demo.name} input={input} action={action} />
      )
      // Let asynchronous loads (media, lazy editors) settle before the snapshot.
      await act(() => new Promise((resolve) => setTimeout(resolve, 50)))

      const data = screen.getByTestId("data").textContent
      const page = document.body.innerHTML
      const elements = [...container.querySelectorAll(reachable)]

      for (const element of elements) {
        if (!element.isConnected) continue
        if (element instanceof HTMLInputElement && element.type === "file") {
          await user.upload(element, new File(["x"], "x.png", { type: "image/png" }))
        } else {
          await user.click(element)
          if (typeable(element)) await user.keyboard("x")
          await user.keyboard(" ")
        }
        ;(document.activeElement as HTMLElement | null)?.blur()

        expect(
          document.body.innerHTML,
          `after acting on ${describeElement(element)}`
        ).toBe(page)
        expect(screen.getByTestId("data").textContent).toBe(data)
      }

      // The file a native input holds is not in the markup: it must stay empty.
      for (const file of container.querySelectorAll("input[type='file']")) {
        expect((file as HTMLInputElement).files ?? []).toHaveLength(0)
      }
    }
  )
})
