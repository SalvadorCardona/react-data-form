import { describe, expect, it, vi } from "vitest"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { MediaObjectGalleryInputController } from "@/media/MediaObjectGalleryInputController"
import {
  MediaObjectProvider,
  defaultMediaObjectLabels,
} from "@/media/MediaObjectPortInterface"
import { createInMemoryMediaObjectPort } from "@/media/inMemoryMediaObjectPort"

describe("MediaObjectGalleryInputController", () => {
  it("creates the gallery then adds an item to it", async () => {
    const port = createInMemoryMediaObjectPort({ onError: vi.fn() })
    const onChange = vi.fn()
    const { container } = render(
      <MediaObjectProvider port={port}>
        <MediaObjectGalleryInputController formInput={{}} onChange={onChange} />
      </MediaObjectProvider>
    )

    fireEvent.click(screen.getByText(defaultMediaObjectLabels.galleryCreateTitle))

    await waitFor(() => expect(port.galleries.size).toBe(1))
    const galleryIri = [...port.galleries.keys()][0]
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ value: galleryIri })
    )
    expect(
      await screen.findByText(defaultMediaObjectLabels.galleryEmptyTitle)
    ).toBeInTheDocument()

    fireEvent.change(
      container.querySelector('input[type="file"]') as HTMLInputElement,
      {
        target: { files: [new File(["image"], "photo.png", { type: "image/png" })] },
      }
    )

    // The item controller uploads into the gallery, then the gallery reloads
    // itself through the port.
    await waitFor(() =>
      expect(port.galleries.get(galleryIri)?.items).toHaveLength(1)
    )
    await waitFor(() =>
      expect(
        screen.queryByText(defaultMediaObjectLabels.galleryEmptyTitle)
      ).not.toBeInTheDocument()
    )
    expect(port.onError).not.toHaveBeenCalled()
  })

  describe("readonly", () => {
    it("only renders the thumbnails and never writes through the port", async () => {
      const port = createInMemoryMediaObjectPort({ onError: vi.fn() })
      const gallery = await port.gallery.create({ role: "galeries" })
      await port.upload({
        base64: "data:image/png;base64,aW1hZ2U=",
        gallery: gallery.iri,
      })
      const upload = vi.spyOn(port, "upload")
      const remove = vi.spyOn(port, "remove")
      const create = vi.spyOn(port.gallery, "create")

      const { container } = render(
        <MediaObjectProvider port={port}>
          <MediaObjectGalleryInputController
            formInput={{ value: gallery.iri, readonly: true }}
            onChange={vi.fn()}
          />
        </MediaObjectProvider>
      )

      await waitFor(() => expect(container.querySelector("img")).toBeInTheDocument())
      expect(container.querySelectorAll('input[type="file"]')).toHaveLength(0)
      expect(
        screen.queryByLabelText(defaultMediaObjectLabels.deleteAction)
      ).not.toBeInTheDocument()
      expect(
        screen.queryByText(defaultMediaObjectLabels.galleryCreateTitle)
      ).not.toBeInTheDocument()
      expect(port.galleries.size).toBe(1)
      expect(upload).not.toHaveBeenCalled()
      expect(remove).not.toHaveBeenCalled()
      expect(create).not.toHaveBeenCalled()
    })

    it("does not create a gallery when the field has none", () => {
      const port = createInMemoryMediaObjectPort({ onError: vi.fn() })
      const create = vi.spyOn(port.gallery, "create")
      render(
        <MediaObjectProvider port={port}>
          <MediaObjectGalleryInputController
            formInput={{ readonly: true }}
            onChange={vi.fn()}
          />
        </MediaObjectProvider>
      )

      expect(
        screen.queryByText(defaultMediaObjectLabels.galleryCreateTitle)
      ).not.toBeInTheDocument()
      fireEvent.click(screen.getByText(defaultMediaObjectLabels.galleryEmptyTitle))
      expect(create).not.toHaveBeenCalled()
      expect(port.galleries.size).toBe(0)
    })
  })

  it("follows a gallery IRI given after the mount, then removed", async () => {
    const port = createInMemoryMediaObjectPort({ onError: vi.fn() })
    const gallery = await port.gallery.create({ role: "galeries" })
    const { rerender } = render(
      <MediaObjectProvider port={port}>
        <MediaObjectGalleryInputController formInput={{}} onChange={vi.fn()} />
      </MediaObjectProvider>
    )

    expect(
      screen.getByText(defaultMediaObjectLabels.galleryCreateTitle)
    ).toBeInTheDocument()

    rerender(
      <MediaObjectProvider port={port}>
        <MediaObjectGalleryInputController
          formInput={{ value: gallery.iri }}
          onChange={vi.fn()}
        />
      </MediaObjectProvider>
    )

    expect(
      await screen.findByText(defaultMediaObjectLabels.galleryEmptyTitle)
    ).toBeInTheDocument()

    rerender(
      <MediaObjectProvider port={port}>
        <MediaObjectGalleryInputController
          formInput={{ value: undefined }}
          onChange={vi.fn()}
        />
      </MediaObjectProvider>
    )

    expect(
      screen.getByText(defaultMediaObjectLabels.galleryCreateTitle)
    ).toBeInTheDocument()
  })
})

describe("MediaObjectGalleryInputController port lifecycle", () => {
  const PNG_DATA_URL = "data:image/png;base64,aW1hZ2U="

  it("drops a deleted media from the list, even before remove resolves", async () => {
    const port = createInMemoryMediaObjectPort({ onError: vi.fn() })
    const gallery = await port.gallery.create({ role: "galeries" })
    await port.upload({ base64: PNG_DATA_URL, gallery: gallery.iri })
    await port.upload({ base64: PNG_DATA_URL, gallery: gallery.iri })
    const remove = port.remove
    let resolveRemove: () => void = () => {}
    port.remove = (iri) =>
      new Promise<void>((resolve) => {
        resolveRemove = () => remove(iri).then(resolve)
      })

    const { container } = render(
      <MediaObjectProvider port={port}>
        <MediaObjectGalleryInputController
          formInput={{ value: gallery.iri }}
          onChange={vi.fn()}
        />
      </MediaObjectProvider>
    )

    const deleteButtons = await screen.findAllByLabelText(
      defaultMediaObjectLabels.deleteAction
    )
    expect(deleteButtons).toHaveLength(2)
    fireEvent.click(deleteButtons[0])

    // One remaining media and the empty tile adding a new one.
    await waitFor(() =>
      expect(container.querySelectorAll('input[type="file"]')).toHaveLength(2)
    )
    resolveRemove()
    await waitFor(() =>
      expect(port.galleries.get(gallery.iri)?.items).toHaveLength(1)
    )
    expect(container.querySelectorAll('input[type="file"]')).toHaveLength(2)
    expect(port.onError).not.toHaveBeenCalled()
  })

  it("reports a gallery that fails to load, then retries the read", async () => {
    const port = createInMemoryMediaObjectPort({ onError: vi.fn() })
    const gallery = await port.gallery.create({ role: "galeries" })
    const read = port.gallery.read
    const failure = new Error("500")
    port.gallery.read = vi
      .fn()
      .mockRejectedValueOnce(failure)
      .mockImplementation(read)
    const create = vi.spyOn(port.gallery, "create")
    const onSubmit = vi.fn((e) => e.preventDefault())

    render(
      <MediaObjectProvider port={port}>
        <form onSubmit={onSubmit}>
          <MediaObjectGalleryInputController
            formInput={{ value: gallery.iri }}
            onChange={vi.fn()}
          />
        </form>
      </MediaObjectProvider>
    )

    expect(
      await screen.findByText(defaultMediaObjectLabels.galleryLoadFailed)
    ).toBeInTheDocument()
    expect(port.onError).toHaveBeenCalledWith(
      defaultMediaObjectLabels.galleryLoadFailed,
      failure
    )

    const retry = screen.getByRole("button", {
      name: defaultMediaObjectLabels.retry,
    })
    expect(retry).toHaveAttribute("type", "button")
    fireEvent.click(retry)

    expect(
      await screen.findByText(defaultMediaObjectLabels.galleryEmptyTitle)
    ).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
    expect(create).not.toHaveBeenCalled()
  })

  it("retries the creation without submitting the form", async () => {
    const port = createInMemoryMediaObjectPort({ onError: vi.fn() })
    const create = port.gallery.create
    port.gallery.create = vi
      .fn()
      .mockRejectedValueOnce(new Error("500"))
      .mockImplementation(create)
    const onSubmit = vi.fn((e) => e.preventDefault())

    render(
      <MediaObjectProvider port={port}>
        <form onSubmit={onSubmit}>
          <MediaObjectGalleryInputController formInput={{}} onChange={vi.fn()} />
        </form>
      </MediaObjectProvider>
    )

    fireEvent.click(screen.getByText(defaultMediaObjectLabels.galleryCreateTitle))
    fireEvent.click(
      await screen.findByRole("button", { name: defaultMediaObjectLabels.retry })
    )

    await waitFor(() => expect(port.galleries.size).toBe(1))
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("applies allowedExtension to the media of the gallery", async () => {
    const port = createInMemoryMediaObjectPort({ onError: vi.fn() })
    const gallery = await port.gallery.create({ role: "galeries" })
    const upload = vi.spyOn(port, "upload")

    const { container } = render(
      <MediaObjectProvider port={port}>
        <MediaObjectGalleryInputController
          formInput={{ value: gallery.iri, allowedExtension: ["png"] }}
          onChange={vi.fn()}
        />
      </MediaObjectProvider>
    )

    await screen.findByText(defaultMediaObjectLabels.galleryEmptyTitle)
    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    expect(input.getAttribute("accept")).toBe(".png,image/png")

    fireEvent.change(input, {
      target: { files: [new File(["image"], "photo.jpg", { type: "image/jpeg" })] },
    })

    expect(port.onError).toHaveBeenCalledWith(
      defaultMediaObjectLabels.unsupportedFormat("PNG")
    )
    expect(upload).not.toHaveBeenCalled()
  })

  it("does not claim drag and drop on the creation tile", () => {
    const port = createInMemoryMediaObjectPort({ onError: vi.fn() })
    render(
      <MediaObjectProvider port={port}>
        <MediaObjectGalleryInputController formInput={{}} onChange={vi.fn()} />
      </MediaObjectProvider>
    )

    expect(screen.queryByText(/drag and drop/)).not.toBeInTheDocument()
  })
})
