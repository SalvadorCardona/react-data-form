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
})
