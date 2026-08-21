import { Area } from "react-easy-crop"

/**
 * Loads an image into an HTMLImageElement.
 *
 * `crossOrigin = "anonymous"` keeps the canvas from being tainted when the
 * source is served by the API; without it `toDataURL()` would throw a
 * SecurityError.
 */
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new window.Image()
    image.addEventListener("load", () => resolve(image))
    image.addEventListener("error", (error) => reject(error))
    image.setAttribute("crossOrigin", "anonymous")
    image.src = url
  })

const getRadianAngle = (degreeValue: number): number => (degreeValue * Math.PI) / 180

/**
 * Bounding-box dimensions of an image after rotation, so that
 * dimensionner le canvas sans rogner les coins pendant la rotation.
 */
const rotateSize = (
  width: number,
  height: number,
  rotation: number
): { width: number; height: number } => {
  const rotRad = getRadianAngle(rotation)
  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  }
}

/**
 * Produces a new image (data URL), cropped and rotated from the source
 * et de la zone de crop fournie par react-easy-crop.
 *
 * The rotated image is first drawn on a canvas sized to its bounding box, then
 * the crop area is extracted onto a second canvas.
 */
export const getCroppedImg = async (
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0,
  mimeType = "image/jpeg"
): Promise<string> => {
  const image = await createImage(imageSrc)
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Contexte 2D indisponible")

  const rotRad = getRadianAngle(rotation)
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    image.width,
    image.height,
    rotation
  )

  canvas.width = bBoxWidth
  canvas.height = bBoxHeight

  ctx.translate(bBoxWidth / 2, bBoxHeight / 2)
  ctx.rotate(rotRad)
  ctx.translate(-image.width / 2, -image.height / 2)
  ctx.drawImage(image, 0, 0)

  const cropCanvas = document.createElement("canvas")
  const cropCtx = cropCanvas.getContext("2d")
  if (!cropCtx) throw new Error("Contexte 2D indisponible")

  cropCanvas.width = pixelCrop.width
  cropCanvas.height = pixelCrop.height

  cropCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  )

  return cropCanvas.toDataURL(mimeType, 0.92)
}
