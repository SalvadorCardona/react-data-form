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
})
