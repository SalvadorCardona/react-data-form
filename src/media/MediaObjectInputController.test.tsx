import { afterEach, describe, expect, it, vi } from "vitest"
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { PropsWithChildren, ReactNode } from "react"
import {
  MediaObjectInputController,
  MediaObjectInputControllerInputInterface,
} from "@/media/MediaObjectInputController"
import {
  MediaObjectPortInterface,
  MediaObjectProvider,
  defaultMediaObjectLabels,
} from "@/media/MediaObjectPortInterface"
import {
  createInMemoryMediaObjectPort,
  InMemoryMediaObjectPortInterface,
} from "@/media/inMemoryMediaObjectPort"
import FormElement from "@/form/component/form/FormElement"
import useForm from "@/form/hook/useForm"

const PNG_DATA_URL = "data:image/png;base64,AAAA"

const buildPort = (
  overrides: Partial<MediaObjectPortInterface> = {}
): InMemoryMediaObjectPortInterface => ({
  ...createInMemoryMediaObjectPort({ onError: vi.fn() }),
  ...overrides,
})

const renderController = (
  port: MediaObjectPortInterface,
  formInput: MediaObjectInputControllerInputInterface = {},
  onChange = vi.fn()
) => {
  const wrapper = ({ children }: PropsWithChildren) => (
    <MediaObjectProvider port={port}>{children}</MediaObjectProvider>
  )
  const utils = render(
    <MediaObjectInputController formInput={formInput} onChange={onChange} />,
    { wrapper }
  )
  return { ...utils, onChange }
}

const getFileInput = (container: HTMLElement) =>
  container.querySelector('input[type="file"]') as HTMLInputElement

const getImageSource = (container: HTMLElement) =>
  container.querySelector("img")?.getAttribute("src")

function MediaForm({
  data,
  onChange,
}: {
  data: { pic: string | null }
  onChange?: (data: any) => void
}) {
  const formContext = useForm({
    form: { inputs: { pic: { controller: MediaObjectInputController } } },
    data,
    onChange,
  })
  return <FormElement {...formContext} />
}

const renderForm = (
  port: MediaObjectPortInterface,
  data: { pic: string | null },
  onChange = vi.fn()
) => {
  const utils = render(
    <MediaObjectProvider port={port}>
      <MediaForm data={data} onChange={onChange} />
    </MediaObjectProvider>
  )
  return { ...utils, onChange }
}

function AsyncMediaForm({
  asyncData,
  next,
}: {
  asyncData: () => Promise<any>
  next: { pic: string | null }
}) {
  const formContext = useForm({
    form: { inputs: { pic: { controller: MediaObjectInputController } } },
    asyncData,
  })
  return (
    <>
      <FormElement {...formContext} />
      <button type="button" onClick={() => formContext.updateData(next)}>
        update
      </button>
    </>
  )
}

/**
 * FileReader whose reading fails: like the browser, `onerror` then
 * `onloadend` are fired, with a null result.
 */
class FailingFileReader {
  result: string | null = null
  error: Error | null = null
  onerror: ((event: unknown) => void) | null = null
  onload: ((event: unknown) => void) | null = null
  onloadend: ((event: unknown) => void) | null = null
  readAsDataURL() {
    setTimeout(() => {
      this.error = new Error("read failed")
      this.onerror?.(this.error)
      this.onloadend?.({})
    })
  }
}

/** Promise resolved from the outside, to order the server responses. */
const deferred = <T,>() => {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((r) => (resolve = r))
  return { promise, resolve }
}

const selectFile = (container: HTMLElement, name: string) =>
  fireEvent.change(getFileInput(container), {
    target: { files: [new File([name], name, { type: "image/png" })] },
  })

/** Seeds the port with an already persisted media and returns its IRI. */
const seedMedia = async (port: MediaObjectPortInterface) =>
  port.upload({ base64: PNG_DATA_URL })

describe("MediaObjectInputController", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("uploads the selected file through the port and keeps its IRI", async () => {
    const port = buildPort()
    const { container, onChange } = renderController(port)

    fireEvent.change(getFileInput(container), {
      target: { files: [new File(["image"], "photo.png", { type: "image/png" })] },
    })

    await waitFor(() => expect(onChange).toHaveBeenCalled())
    const iri = onChange.mock.calls.at(-1)?.[0].value
    expect(port.medias.get(iri)).toBeDefined()
  })

  it("refuses a file whose format is not accepted", async () => {
    const port = buildPort()
    const { container, onChange } = renderController(port)

    fireEvent.change(getFileInput(container), {
      target: { files: [new File(["note"], "note.txt", { type: "text/plain" })] },
    })

    await waitFor(() =>
      expect(port.onError).toHaveBeenCalledWith(
        defaultMediaObjectLabels.unsupportedFormat("PNG or JPG")
      )
    )
    expect(port.medias.size).toBe(0)
    expect(onChange).not.toHaveBeenCalled()
  })

  it("refuses a file heavier than the limit", async () => {
    const port = buildPort()
    const { container, onChange } = renderController(port, { max: 1 })

    fireEvent.change(getFileInput(container), {
      target: {
        files: [
          new File(["x".repeat(2 * 1024 * 1024)], "big.png", { type: "image/png" }),
        ],
      },
    })

    await waitFor(() =>
      expect(port.onError).toHaveBeenCalledWith(
        defaultMediaObjectLabels.fileTooLarge(1)
      )
    )
    expect(port.medias.size).toBe(0)
    expect(onChange).not.toHaveBeenCalled()
  })

  it("restores the previous preview when the upload fails", async () => {
    const port = buildPort()
    const iri = await seedMedia(port)
    const upload = vi.fn().mockRejectedValue(new Error("server down"))
    const { container, onChange } = renderController(
      { ...port, upload },
      { value: iri }
    )

    await waitFor(() => expect(getImageSource(container)).toBe(PNG_DATA_URL))

    fireEvent.change(getFileInput(container), {
      target: { files: [new File(["image"], "photo.png", { type: "image/png" })] },
    })

    await waitFor(() => expect(upload).toHaveBeenCalled())
    // No false success: the preview goes back to the media already saved and
    // the field keeps its value.
    await waitFor(() => expect(getImageSource(container)).toBe(PNG_DATA_URL))
    expect(port.onError).toHaveBeenCalledWith(
      defaultMediaObjectLabels.uploadFailed,
      expect.any(Error)
    )
    expect(onChange).not.toHaveBeenCalled()
  })

  it("sends nothing when the file cannot be read", async () => {
    vi.stubGlobal("FileReader", FailingFileReader)
    const port = buildPort()
    const upload = vi.fn(port.upload)
    const { container, onChange } = renderController({ ...port, upload })

    selectFile(container, "photo.png")

    await waitFor(() =>
      expect(port.onError).toHaveBeenCalledWith(
        defaultMediaObjectLabels.readFailed,
        expect.any(Error)
      )
    )
    await act(() => new Promise((r) => setTimeout(r, 10)))
    expect(upload).not.toHaveBeenCalled()
    expect(onChange).not.toHaveBeenCalled()
  })

  it("sends one file at a time", async () => {
    const port = buildPort()
    const responses = { "A.png": deferred<string>(), "B.png": deferred<string>() }
    const upload = vi.fn(() => {
      const name = upload.mock.calls.length === 1 ? "A.png" : "B.png"
      return responses[name].promise
    })
    const { container, onChange } = renderController({ ...port, upload })

    selectFile(container, "A.png")
    await waitFor(() => expect(upload).toHaveBeenCalledTimes(1))

    // The zone is busy: neither the input nor a new selection starts a send.
    expect(getFileInput(container)).toBeDisabled()
    expect(container.querySelector('[aria-busy="true"]')).not.toBeNull()
    selectFile(container, "B.png")
    await act(() => new Promise((r) => setTimeout(r, 10)))
    expect(upload).toHaveBeenCalledTimes(1)

    // Even answered in reverse order, the last value is the one of A.
    await act(async () => {
      responses["B.png"].resolve("/m/B")
      responses["A.png"].resolve("/m/A")
    })
    await waitFor(() => expect(onChange).toHaveBeenCalled())
    expect(onChange.mock.calls.map(([input]) => input.value)).toEqual(["/m/A"])
    expect(getFileInput(container)).not.toBeDisabled()
  })

  it("removes the media through the port", async () => {
    const port = buildPort()
    const iri = await seedMedia(port)
    const { onChange } = renderController(port, { value: iri })

    fireEvent.click(
      await screen.findByLabelText(defaultMediaObjectLabels.deleteAction)
    )

    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ value: null })
    )
    await waitFor(() => expect(port.medias.size).toBe(0))
  })

  it("empties the field of a real form when the picture is deleted", async () => {
    const port = buildPort()
    const iri = await seedMedia(port)
    const { container, onChange } = renderForm(port, { pic: iri })

    fireEvent.click(
      await screen.findByLabelText(defaultMediaObjectLabels.deleteAction)
    )

    await waitFor(() =>
      expect(onChange).toHaveBeenLastCalledWith({ pic: null }, expect.anything())
    )
    expect(getFileInput(container)).toBeInTheDocument()
    expect(container.querySelector("img")).toBeNull()
    await waitFor(() => expect(port.medias.size).toBe(0))
  })

  it("mounts in a real form whose value is null", () => {
    const port = buildPort()
    const { container } = renderForm(port, { pic: null })

    expect(getFileInput(container)).toBeInTheDocument()
    expect(screen.queryByLabelText(defaultMediaObjectLabels.deleteAction)).toBeNull()
  })

  it("displays the URL returned by the port as is", async () => {
    const port = buildPort({ toUrl: () => "/api/media_objects/12/content" })
    const iri = await seedMedia(port)
    const { container } = renderController(port, {
      value: iri,
      readonly: true,
    })

    expect(getImageSource(container)).toBe("/api/media_objects/12/content")
  })

  it("renders a local fallback when the port has no URL", async () => {
    const port = buildPort({ toUrl: () => undefined })
    const iri = await seedMedia(port)
    const { container } = renderController(port, {
      value: iri,
      readonly: true,
    })

    expect(container.querySelector("img")).toBeNull()
    expect(screen.getByRole("img")).toBeTruthy()
  })

  describe("follows formInput.value", () => {
    const rerenderController = (
      rerender: (ui: ReactNode) => void,
      formInput: MediaObjectInputControllerInputInterface
    ) =>
      rerender(
        <MediaObjectInputController formInput={formInput} onChange={vi.fn()} />
      )

    it("shows a value given after the mount", async () => {
      const port = buildPort()
      const iri = await seedMedia(port)
      const { container, rerender } = renderController(port, {})

      expect(container.querySelector("img")).toBeNull()

      rerenderController(rerender, { value: iri })

      await waitFor(() => expect(getImageSource(container)).toBe(PNG_DATA_URL))
    })

    it("hides the picture once the value is removed", async () => {
      const port = buildPort()
      const iri = await seedMedia(port)
      const { container, rerender } = renderController(port, { value: iri })

      await waitFor(() => expect(getImageSource(container)).toBe(PNG_DATA_URL))

      rerenderController(rerender, { value: undefined })

      expect(container.querySelector("img")).toBeNull()
      expect(
        screen.queryByLabelText(defaultMediaObjectLabels.deleteAction)
      ).toBeNull()
    })

    it("shows the new picture when the value is replaced", async () => {
      const port = buildPort()
      const first = await seedMedia(port)
      const second = await port.upload({ base64: "data:image/png;base64,BBBB" })
      const { container, rerender } = renderController(port, { value: first })

      await waitFor(() => expect(getImageSource(container)).toBe(PNG_DATA_URL))

      rerenderController(rerender, { value: second })

      await waitFor(() =>
        expect(getImageSource(container)).toBe("data:image/png;base64,BBBB")
      )
    })

    it("drops the preview of an upload once the value is reset", async () => {
      const port = buildPort()
      const { container, rerender } = renderController(port, {})

      fireEvent.change(getFileInput(container), {
        target: { files: [new File(["image"], "photo.png", { type: "image/png" })] },
      })
      await waitFor(() => expect(container.querySelector("img")).not.toBeNull())
      const iri = [...port.medias.keys()][0]

      rerenderController(rerender, { value: iri })
      rerenderController(rerender, { value: undefined })

      expect(container.querySelector("img")).toBeNull()
    })

    it("follows the data of useForm({ asyncData }) then updateData", async () => {
      const port = buildPort()
      const first = await seedMedia(port)
      const second = await port.upload({ base64: "data:image/png;base64,BBBB" })
      const { container } = render(
        <MediaObjectProvider port={port}>
          <AsyncMediaForm
            asyncData={async () => ({ pic: first })}
            next={{ pic: second }}
          />
        </MediaObjectProvider>
      )

      await waitFor(() => expect(getImageSource(container)).toBe(PNG_DATA_URL))

      fireEvent.click(screen.getByText("update"))

      await waitFor(() =>
        expect(getImageSource(container)).toBe("data:image/png;base64,BBBB")
      )
    })
  })
})
