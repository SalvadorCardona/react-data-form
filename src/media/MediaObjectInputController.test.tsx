import { beforeEach, describe, expect, it, vi } from "vitest"
import { fireEvent, render, waitFor } from "@testing-library/react"
import { MediaObjectInputController } from "@/media/MediaObjectInputController"
import { FormInputInterface } from "@/form/FormInputInterface"
import { configurePorts, MediaUploaderInterface } from "@/ports"
import { toast } from "sonner"

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

const uploader = {
  upload: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  getMeta: vi.fn(),
} satisfies MediaUploaderInterface

const buildFormInput = (
  overrides: Partial<FormInputInterface<string | null | undefined>> = {}
): FormInputInterface<string | null | undefined> => ({
  name: "profilePicture",
  value: undefined,
  ...overrides,
})

const renderController = (onChange = vi.fn()) => {
  const result = render(
    <MediaObjectInputController formInput={buildFormInput()} onChange={onChange} />
  )
  const input = result.container.querySelector(
    'input[type="file"]'
  ) as HTMLInputElement

  return { ...result, input, onChange }
}

const selectFile = (input: HTMLInputElement, file: File) => {
  Object.defineProperty(input, "files", { value: [file], configurable: true })
  fireEvent.change(input)
}

describe("MediaObjectInputController", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    uploader.getMeta.mockResolvedValue(null)
    configurePorts({ mediaUploader: uploader })
  })

  it("lie le média au formulaire quand l'upload réussit", async () => {
    uploader.upload.mockResolvedValue("/api/media_objects/123")

    const { input, onChange } = renderController()
    selectFile(input, new File(["x"], "photo.png", { type: "image/png" }))

    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ value: "/api/media_objects/123" })
      )
    )
    expect(toast.error).not.toHaveBeenCalled()
  })

  it("prévient l'utilisateur et n'enregistre rien quand l'upload échoue côté serveur", async () => {
    uploader.upload.mockRejectedValue(new Error("Boom"))

    const { input, onChange } = renderController()
    selectFile(input, new File(["x"], "photo.png", { type: "image/png" }))

    await waitFor(() => expect(uploader.upload).toHaveBeenCalled())
    await waitFor(() => expect(toast.error).toHaveBeenCalled())

    // Aucune valeur de média ne doit être propagée au formulaire : on ne doit
    // jamais laisser croire que la photo a été enregistrée.
    expect(onChange).not.toHaveBeenCalledWith(
      expect.objectContaining({ value: expect.stringContaining("media_object") })
    )
  })

  it("refuse un fichier trop volumineux sans appeler l'API", () => {
    const { input } = renderController()
    const file = new File(["x"], "huge.png", { type: "image/png" })
    Object.defineProperty(file, "size", { value: 11 * 1024 * 1024 })

    selectFile(input, file)

    expect(toast.error).toHaveBeenCalled()
    expect(uploader.upload).not.toHaveBeenCalled()
  })

  it("refuse un format non supporté sans appeler l'API", () => {
    const { input } = renderController()
    selectFile(input, new File(["x"], "archive.zip", { type: "application/zip" }))

    expect(toast.error).toHaveBeenCalled()
    expect(uploader.upload).not.toHaveBeenCalled()
  })

  it("échoue explicitement quand aucun uploader n'est configuré", async () => {
    configurePorts({ mediaUploader: undefined })

    const { input, onChange } = renderController()
    selectFile(input, new File(["x"], "photo.png", { type: "image/png" }))

    await waitFor(() => expect(toast.error).toHaveBeenCalled())
    expect(onChange).not.toHaveBeenCalled()
  })
})
