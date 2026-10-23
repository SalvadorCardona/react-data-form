import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest"
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
 * The smoke test of every controller: each one the library exports is rendered
 * empty, filled and read-only, then every element a user could reach is
 * clicked and typed into. None of it may throw nor write to the console — a
 * React warning there is a bug a reader of the console would see first.
 */
const exportedControllers = Object.entries({ ...library, ...media })
  .filter(
    ([name, value]) =>
      /^[A-Z]\w*InputController$/.test(name) && typeof value === "function"
  )
  .map(([name]) => name)

/**
 * Console messages some controllers still write, left to tickets of their own:
 * each entry is to be removed by the ticket that fixes it.
 */
const pending: Record<string, string> = {
  // `defaultValue` follows `formInput.value`, which Base UI warns about.
  DefaultInputController: "Base UI: A component is changing the default value",
  // StarterKit already ships the link extension the editor adds again.
  WysiwygInputController: "[tiptap warn]: Duplicate extension names found",
}

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

function Field({ name, input }: { name: string; input: FormInputInterface }) {
  const fixture = fixtures[name]
  const form: FormInterface = {
    label: {},
    components: { formSubmitAction: () => null },
    inputs: { field: input, ...fixture?.inputs },
    onSubmit: (data) => data,
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

/** Let asynchronous loads (media, lazy editors, debounced searches) settle. */
const settle = () => act(() => new Promise((resolve) => setTimeout(resolve, 50)))

/** The first line of what was written to the console, for a readable diff. */
const message = ([format, ...args]: unknown[]) =>
  String(format instanceof Error ? format.message : format)
    .replace(/%s/g, () => String(args.shift()))
    .split("\n")[0]

// The comboboxes, the editor and the slider rely on browser APIs jsdom does
// not implement.
beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  Element.prototype.scrollIntoView ??= () => {}
  document.elementFromPoint ??= () => null
  Element.prototype.setPointerCapture ??= () => {}
  Element.prototype.releasePointerCapture ??= () => {}
  Element.prototype.hasPointerCapture ??= () => false
})

let consoleError: ReturnType<typeof vi.spyOn>
let consoleWarn: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  consoleError = vi.spyOn(console, "error").mockImplementation(() => {})
  consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {})
})

afterEach(() => {
  consoleError.mockRestore()
  consoleWarn.mockRestore()
  cleanup()
})

describe("every exported controller", () => {
  it("has a gallery demo to be rendered with", () => {
    const named = allDemos.map((demo) => demo.name)
    expect(exportedControllers.filter((name) => !named.includes(name))).toEqual([])
  })

  for (const name of Object.keys(pending)) {
    it.todo(`${name} writes nothing to the console`)
  }

  const cases = allDemos
    .filter((demo) => exportedControllers.includes(demo.name))
    .flatMap((demo) => [
      { mode: "empty", demo, input: demo.input },
      ...(demo.filled === undefined
        ? []
        : [{ mode: "filled", demo, input: { ...demo.input, value: demo.filled } }]),
      {
        mode: "read-only",
        demo,
        input: {
          ...demo.input,
          value: demo.filled ?? demo.input.value,
          readonly: true,
        },
      },
    ])

  it.each(cases)(
    "$demo.name ($mode) renders and takes input without a console error",
    async ({ demo, input }) => {
      const user = userEvent.setup({ pointerEventsCheck: 0 })
      const { container } = render(<Field name={demo.name} input={input} />)
      await settle()

      expect(screen.getByTestId("data")).toBeInTheDocument()

      for (const element of [...container.querySelectorAll(reachable)]) {
        if (!element.isConnected) continue
        if (element instanceof HTMLInputElement && element.type === "file") {
          await user.upload(element, new File(["x"], "x.png", { type: "image/png" }))
        } else {
          await user.click(element)
          if (typeable(element)) await user.keyboard("1")
        }
        act(() => (document.activeElement as HTMLElement | null)?.blur())
      }
      await settle()

      const unexpected = (calls: unknown[][]) =>
        calls
          .map(message)
          .filter(
            (text) => !pending[demo.name] || !text.startsWith(pending[demo.name])
          )
      expect(unexpected(consoleError.mock.calls)).toEqual([])
      expect(unexpected(consoleWarn.mock.calls)).toEqual([])
    }
  )
})
