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
import { toast } from "sonner"
import { getCroppedImg } from "@/media/cropImage"

export interface ImageEditorProps {
  /** URL (ou data URL) de l'image source à éditer. */
  src: string
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Reçoit la nouvelle image en data URL, une fois validée. */
  onSave: (base64: string) => void | Promise<void>
  /** Ratio du cadre de recadrage (largeur / hauteur). Défaut : 1 (carré). */
  aspect?: number
}

const normalizeSliderValue = (value: number | readonly number[]): number =>
  Array.isArray(value) ? value[0] : (value as number)

/**
 * Éditeur d'image : recadrage (crop), zoom et rotation. Sert à corriger les
 * « photos de travers » (orientation) et à cadrer les photos de profil /
 * galeries. Produit une nouvelle image en data URL transmise via `onSave`.
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

  const onCropComplete = useCallback((_: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels)
  }, [])

  const rotate = (delta: number) => {
    // Reste dans [0, 360[ pour garder un slider cohérent.
    setRotation((prev) => (((prev + delta) % 360) + 360) % 360)
  }

  const handleSave = async () => {
    if (!croppedAreaPixels) return
    setIsSaving(true)
    try {
      const image = await getCroppedImg(src, croppedAreaPixels, rotation)
      await onSave(image)
      onOpenChange(false)
    } catch {
      toast.error("Impossible d'appliquer les modifications. Veuillez réessayer.")
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
          <DialogTitle>Modifier la photo</DialogTitle>
          <DialogDescription id="image-editor-description">
            Recadrez, zoomez ou pivotez l&#39;image, puis enregistrez.
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
              aria-label="Zoom"
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
              aria-label="Rotation"
            />
            <div className="flex gap-1 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => rotate(-90)}
                aria-label="Pivoter à gauche"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => rotate(90)}
                aria-label="Pivoter à droite"
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
            Annuler
          </Button>
          <Button type="button" onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
