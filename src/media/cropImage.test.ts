import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { getCroppedImg } from "@/media/cropImage"

/**
 * jsdom neither loads images nor draws on a canvas: the image reports a fixed
 * size as soon as its source is set (or fails to, for a broken one), and each
 * canvas records what was drawn on it.
 */
class LoadedImage extends EventTarget {
  width = 40
  height = 20
  setAttribute() {}
  set src(url: string) {
    queueMicrotask(() =>
      this.dispatchEvent(new Event(url === "broken" ? "error" : "load"))
    )
  }
}

interface RecordedCanvas {
  width: number
  height: number
  context: Record<string, ReturnType<typeof vi.fn>>
}

let canvases: RecordedCanvas[]

beforeEach(() => {
  canvases = []
  vi.stubGlobal("Image", LoadedImage)
  const createElement = document.createElement.bind(document)
  vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
    if (tag !== "canvas") return createElement(tag)
    const canvas: RecordedCanvas & Record<string, unknown> = {
      width: 0,
      height: 0,
      context: {
        translate: vi.fn(),
        rotate: vi.fn(),
        drawImage: vi.fn(),
      },
    }
    canvas.getContext = () => canvas.context
    canvas.toDataURL = (type: string, quality: number) =>
      `data:${type};quality=${quality};${canvas.width}x${canvas.height}`
    canvases.push(canvas)
    return canvas as unknown as HTMLCanvasElement
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe("getCroppedImg", () => {
  it("extracts the crop area of the image, at its size and in the type asked", async () => {
    const area = { x: 5, y: 2, width: 10, height: 8 }

    const result = await getCroppedImg("image.png", area, 0, "image/png")

    expect(result).toBe("data:image/png;quality=0.92;10x8")
    const [rotated, cropped] = canvases
    expect([rotated.width, rotated.height]).toEqual([40, 20])
    expect(cropped.context.drawImage).toHaveBeenCalledWith(
      rotated,
      5,
      2,
      10,
      8,
      0,
      0,
      10,
      8
    )
  })

  it("sizes the rotated canvas to the bounding box of the turned image", async () => {
    await getCroppedImg("image.png", { x: 0, y: 0, width: 1, height: 1 }, 90)

    const [rotated] = canvases
    expect(rotated.width).toBeCloseTo(20)
    expect(rotated.height).toBeCloseTo(40)
    expect(rotated.context.rotate).toHaveBeenCalledWith(Math.PI / 2)
  })

  it("defaults to a JPEG", async () => {
    const result = await getCroppedImg("image.png", {
      x: 0,
      y: 0,
      width: 3,
      height: 3,
    })

    expect(result).toBe("data:image/jpeg;quality=0.92;3x3")
  })

  it("rejects when the image cannot be loaded", async () => {
    await expect(
      getCroppedImg("broken", { x: 0, y: 0, width: 1, height: 1 })
    ).rejects.toBeInstanceOf(Event)
    expect(canvases).toEqual([])
  })
})
