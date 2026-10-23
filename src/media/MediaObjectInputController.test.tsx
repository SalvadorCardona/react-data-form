import { describe, expect, it, vi } from "vitest"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { PropsWithChildren } from "react"
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

/** Seeds the port with an already persisted media and returns its IRI. */
const seedMedia = async (port: MediaObjectPortInterface) =>
  port.upload({ base64: PNG_DATA_URL })

describe("MediaObjectInputController", () => {
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
})
