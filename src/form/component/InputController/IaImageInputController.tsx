import { InputControllerInterface } from "@/form/InputControllerInterface"
import { FormInputInterface } from "@/form/FormInputInterface"
import React, { useRef, useState } from "react"
import { Input } from "@/ui/input"
import { FileText, ScanLine, Upload, X } from "lucide-react"
import { Button } from "@/ui/button"
import { Image } from "@/ui/Image"
import { cn } from "@/ui/cn"

export type IaImageInputControllerInterface = FormInputInterface<
  string | null | undefined
>

/**
 * Generic image capture controller for AI analysis workflows.
 * Stores the raw base64 data URL as the field value (no server upload).
 * The parent form's onNextStep is responsible for calling the AI endpoint.
 */
export const IaImageInputController = ({
  formInput,
  onChange,
}: InputControllerInterface<IaImageInputControllerInterface>) => {
  const [preview, setPreview] = useState<string | null | undefined>(formInput.value)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const change = (value: string | null) => {
    setPreview(value)
    onChange({ ...formInput, value })
  }

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") return
    const reader = new FileReader()
    reader.onloadend = () => change(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    change(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  if (formInput.readonly) {
    return <Image className="aspect-square w-full max-w-md" src={preview} />
  }

  return (
    <div
      className={cn(
        "relative w-full max-w-[340px] mx-auto aspect-square border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors",
        isDragging
          ? "border-primary bg-primary/10"
          : "border-input hover:border-primary",
        preview ? "p-0" : "p-6"
      )}
      onClick={() => fileInputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={(e) => {
        e.preventDefault()
        setIsDragging(false)
      }}
      onDrop={handleDrop}
    >
      <Input
        type="file"
        accept="image/*,application/pdf"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="sr-only"
      />

      {preview ? (
        <>
          {preview.startsWith("data:application/pdf") ? (
            <div className="flex flex-col items-center justify-center gap-2 w-full h-full">
              <FileText className="w-14 h-14 text-primary" />
              <span className="text-xs text-muted-foreground">Document PDF</span>
            </div>
          ) : (
            <Image
              src={preview}
              className="w-full h-full object-contain rounded-xl"
            />
          )}
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 z-10 opacity-80 hover:opacity-100 w-6 h-6"
            onClick={handleClear}
          >
            <X className="h-3 w-3" />
          </Button>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 text-center pointer-events-none">
          <div className="p-4 rounded-full bg-primary/10">
            <ScanLine className="w-7 h-7 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {formInput.placeholder ?? "Cliquez ou déposez une image"}
            </p>
            <p className="text-xs text-muted-foreground">
              L'IA analysera cette image pour remplir le formulaire
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs text-primary/70">
            <Upload className="w-3 h-3" />
            <span>PNG, JPG, WEBP, PDF</span>
          </div>
        </div>
      )}
    </div>
  )
}
