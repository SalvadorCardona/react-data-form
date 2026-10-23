import { useCallback, useState } from "react"
import Cropper, { Area } from "react-easy-crop"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/ui/dialog"
import { Button } from "@/ui/button"
import { Slider } from "@/ui/slider"
import { Loader2, RotateCcw, RotateCw, ZoomIn } from "lucide-react"
import { getCroppedImg } from "@/media/cropImage"
import {
  useMediaObjectLabels,
  useMediaObjectPort,
} from "@/media/MediaObjectPortInterface"

export interface ImageEditorProps {
  /** URL (or data URL) of the source image to edit. */
  src: string
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Receives the new image as a data URL once confirmed. */
  onSave: (base64: string) => void | Promise<void>
  /** Aspect ratio of the crop frame (width / height). Defaults to 1 (square). */
  aspect?: number
}

const normalizeSliderValue = (value: number | readonly number[]): number =>
  Array.isArray(value) ? value[0] : (value as number)

/**
 * Image editor: crop, zoom and rotation. Used to straighten tilted photos and
 * to frame profile pictures /
 * galeries. Produit une nouvelle image en data URL transmise via `onSave`.
 *
 * Its texts come from the labels of {@link MediaObjectProvider}, and a failure
 * goes through `port.onError` with `labels.editFailed`.
 */
export const ImageEditor = ({
  src,
  open,
  onOpenChange,
  onSave,
  aspect = 1,
}: ImageEditorProps) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const port = useMediaObjectPort()
  const labels = useMediaObjectLabels()

  const onCropComplete = useCallback((_: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels)
  }, [])

  const rotate = (delta: number) => {
    // Stay within [0, 360) to keep the slider consistent.
    setRotation((prev) => (((prev + delta) % 360) + 360) % 360)
  }

  const handleSave = async () => {
    if (!croppedAreaPixels) return
    setIsSaving(true)
    try {
      const image = await getCroppedImg(src, croppedAreaPixels, rotation)
      await onSave(image)
      onOpenChange(false)
    } catch (error) {
      port.onError?.(labels.editFailed, error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-lg"
        aria-describedby="image-editor-description"
      >
        <DialogHeader>
          <DialogTitle>{labels.editorTitle}</DialogTitle>
          <DialogDescription id="image-editor-description">
            {labels.editorDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="relative w-full aspect-square bg-muted rounded-md overflow-hidden">
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <ZoomIn className="h-4 w-4 shrink-0 text-muted-foreground" />
            <Slider
              value={zoom}
              min={1}
              max={3}
              step={0.01}
              onValueChange={(value) => setZoom(normalizeSliderValue(value))}
              aria-label={labels.editorZoom}
            />
          </div>

          <div className="flex items-center gap-3">
            <RotateCw className="h-4 w-4 shrink-0 text-muted-foreground" />
            <Slider
              value={rotation}
              min={0}
              max={360}
              step={1}
              onValueChange={(value) => setRotation(normalizeSliderValue(value))}
              aria-label={labels.editorRotation}
            />
            <div className="flex gap-1 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => rotate(-90)}
                aria-label={labels.editorRotateLeft}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => rotate(90)}
                aria-label={labels.editorRotateRight}
              >
                <RotateCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            {labels.editorCancel}
          </Button>
          <Button type="button" onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {labels.editorSave}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
