import { describe, expect, it, vi } from "vitest"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { useEffect } from "react"
import { ImageEditor } from "@/media/ImageEditor"
import {
  MediaObjectProvider,
  defaultMediaObjectLabels,
} from "@/media/MediaObjectPortInterface"
import { createInMemoryMediaObjectPort } from "@/media/inMemoryMediaObjectPort"

// jsdom loads no image: the cropper reports its area right away and the
// canvas work is stubbed.
function Cropper({
  onCropComplete,
}: {
  onCropComplete: (area: unknown, areaPixels: unknown) => void
}) {
  useEffect(() => {
    const area = { x: 0, y: 0, width: 10, height: 10 }
    onCropComplete(area, area)
  }, [onCropComplete])
  return null
}
vi.mock("react-easy-crop", () => ({ default: Cropper }))

const getCroppedImg = vi.hoisted(() => vi.fn())
vi.mock("@/media/cropImage", () => ({ getCroppedImg }))

const renderEditor = (labels = {}, onSave = vi.fn()) => {
  const port = createInMemoryMediaObjectPort({ onError: vi.fn() })
  const onOpenChange = vi.fn()
  render(
    <MediaObjectProvider port={port} labels={labels}>
      <ImageEditor
        src="data:image/png;base64,AAAA"
        open
        onOpenChange={onOpenChange}
        onSave={onSave}
      />
    </MediaObjectProvider>
  )
  return { port, onOpenChange, onSave }
}

describe("ImageEditor", () => {
  it("displays the labels of the provider", () => {
    renderEditor({
      editorTitle: "Modifier la photo",
      editorCancel: "Annuler",
      editorSave: "Enregistrer",
      editorZoom: "Agrandir",
      editorRotateLeft: "Pivoter à gauche",
    })

    expect(screen.getByText("Modifier la photo")).toBeTruthy()
    expect(screen.getByRole("button", { name: "Annuler" })).toBeTruthy()
    expect(screen.getByRole("button", { name: "Enregistrer" })).toBeTruthy()
    expect(screen.getByRole("button", { name: "Pivoter à gauche" })).toBeTruthy()
    expect(screen.getByText(defaultMediaObjectLabels.editorDescription)).toBeTruthy()
    expect(screen.getAllByLabelText("Agrandir").length).toBeGreaterThan(0)
  })

  it("reports a failure through port.onError and stays open", async () => {
    const error = new Error("canvas")
    getCroppedImg.mockRejectedValueOnce(error)
    const { port, onOpenChange, onSave } = renderEditor()

    fireEvent.click(
      screen.getByRole("button", { name: defaultMediaObjectLabels.editorSave })
    )

    await waitFor(() =>
      expect(port.onError).toHaveBeenCalledWith(
        defaultMediaObjectLabels.editFailed,
        error
      )
    )
    expect(onSave).not.toHaveBeenCalled()
    expect(onOpenChange).not.toHaveBeenCalledWith(false)
  })

  it("hands the edited image to onSave and closes", async () => {
    getCroppedImg.mockResolvedValueOnce("data:image/jpeg;base64,BBBB")
    const { port, onOpenChange, onSave } = renderEditor()

    fireEvent.click(
      screen.getByRole("button", { name: defaultMediaObjectLabels.editorSave })
    )

    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false))
    expect(onSave).toHaveBeenCalledWith("data:image/jpeg;base64,BBBB")
    expect(port.onError).not.toHaveBeenCalled()
  })
})
