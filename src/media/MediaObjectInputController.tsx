import React, { FC, useEffect, useRef, useState } from "react"
import { getLdIri } from "jsonld-item"
import { Download, FileText, Loader2, Pencil, Upload, X } from "lucide-react"
import { InputControllerInterface } from "@/form/InputControllerInterface"
import { FormInputInterface } from "@/form/FormInputInterface"
import { Input } from "@/ui/input"
import { Button } from "@/ui/button"
import { Image } from "@/ui/Image"
import { cn } from "@/ui/cn"
import { ImageEditor } from "@/media/ImageEditor"
import {
  MediaObjectPortInterface,
  useMediaObjectLabels,
  useMediaObjectPort,
} from "@/media/MediaObjectPortInterface"

export interface MediaObjectInputControllerInputInterface extends FormInputInterface {
  gallery?: string
  /** Accepted file types. Defaults to images (PNG/JPG). */
  acceptedTypes?: MediaObjectAcceptedFileType[]
  /**
   * Enables image editing (cropping + rotation) after upload. Useful to
   * straighten tilted photos (profile pictures, galleries…).
   */
  isEditable?: boolean
  /** Aspect ratio of the editor crop frame. Defaults to 1 (square). */
  editorAspect?: number
}

export interface MediaObjectAcceptedFileType {
  /** RFC 6838 media type, e.g. "image/png", "application/pdf". */
  mime: string
  /** File extensions accepted (with leading dot). */
  extensions: string[]
  /** Short label shown in the empty-state hint, e.g. "PNG", "JPG", "PDF". */
  label: string
  /** How the file should be previewed once uploaded. */
  preview: "image" | "document"
}

export interface MediaObjectInputControllerOptions {
  acceptedTypes?: MediaObjectAcceptedFileType[]
}

export const IMAGE_ACCEPTED_TYPES: MediaObjectAcceptedFileType[] = [
  { mime: "image/png", extensions: [".png"], label: "PNG", preview: "image" },
  {
    mime: "image/jpeg",
    extensions: [".jpg", ".jpeg"],
    label: "JPG",
    preview: "image",
  },
]

export const PDF_ACCEPTED_TYPE: MediaObjectAcceptedFileType = {
  mime: "application/pdf",
  extensions: [".pdf"],
  label: "PDF",
  preview: "document",
}

/**
 * Accepted file types for documents attached to a resource (report, exam,
 * diploma…): images, PDF and the usual office formats.
 */
export const DOCUMENT_ACCEPTED_TYPES: MediaObjectAcceptedFileType[] = [
  ...IMAGE_ACCEPTED_TYPES,
  PDF_ACCEPTED_TYPE,
  {
    mime: "application/msword",
    extensions: [".doc"],
    label: "DOC",
    preview: "document",
  },
  {
    mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    extensions: [".docx"],
    label: "DOCX",
    preview: "document",
  },
  {
    mime: "application/vnd.ms-excel",
    extensions: [".xls"],
    label: "XLS",
    preview: "document",
  },
  {
    mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    extensions: [".xlsx"],
    label: "XLSX",
    preview: "document",
  },
]

const buildAcceptAttribute = (types: MediaObjectAcceptedFileType[]): string => {
  const exts = types.flatMap((t) => t.extensions)
  const mimes = types.map((t) => t.mime)
  return [...exts, ...mimes].join(",")
}

const findAcceptedType = (
  types: MediaObjectAcceptedFileType[],
  file: File
): MediaObjectAcceptedFileType | undefined => {
  const fileExt = file.name.includes(".")
    ? "." + file.name.split(".").pop()!.toLowerCase()
    : ""
  return types.find((t) => t.mime === file.type || t.extensions.includes(fileExt))
}

const resolvePreviewKind = (
  types: MediaObjectAcceptedFileType[],
  mimeType: string
): "image" | "document" => {
  const matched = types.find((t) => t.mime === mimeType)
  if (matched) return matched.preview
  return mimeType.startsWith("image/") ? "image" : "document"
}

const isDataUrl = (value: unknown): value is string =>
  typeof value === "string" && value.startsWith("data:")

/**
 * A freshly read file is already a data URL: it is displayable as is, and the
 * port has nothing to say about a media it has not stored yet.
 */
const resolveUrl = (
  port: MediaObjectPortInterface,
  value: string | null | undefined,
  options?: { download?: boolean }
): string | undefined => {
  if (isDataUrl(value)) return options?.download ? undefined : value
  return port.toUrl(value, options)
}

/**
 * Builds a {@link FormInputInterface} for a media upload: the factory returns a
 * `formInput` already bound to its controller, ready to drop into a form.
 *
 * @example
 * profilePicture: createMediaObjectInput({ isEditable: true })
 */
export function createMediaObjectInput(
  props: MediaObjectInputControllerInputInterface = {}
): MediaObjectInputControllerInputInterface {
  return {
    controller: MediaObjectInputController,
    ...props,
  }
}

/** {@link createMediaObjectInput} variant also accepting PDF files. */
export const createMediaObjectWithPdfInput = (
  props: MediaObjectInputControllerInputInterface = {}
): MediaObjectInputControllerInputInterface =>
  createMediaObjectInput({
    acceptedTypes: [...IMAGE_ACCEPTED_TYPES, PDF_ACCEPTED_TYPE],
    ...props,
  })

/** {@link createMediaObjectInput} variant accepting every document format. */
export const createMediaObjectDocumentInput = (
  props: MediaObjectInputControllerInputInterface = {}
): MediaObjectInputControllerInputInterface =>
  createMediaObjectInput({
    acceptedTypes: DOCUMENT_ACCEPTED_TYPES,
    ...props,
  })

/**
 * Builds a media controller with its own set of default accepted types.
 * `formInput.acceptedTypes` (set by the factory) still wins, so the component
 * works both directly (`controller: MediaObjectInputController`) and through
 * {@link createMediaObjectInput}.
 */
export const mediaObjectInputControllerFactory = (
  options: MediaObjectInputControllerOptions = {}
): FC<InputControllerInterface<MediaObjectInputControllerInputInterface>> => {
  const defaultAcceptedTypes = options.acceptedTypes ?? IMAGE_ACCEPTED_TYPES

  return function MediaObjectInputControllerVariant({
    formInput,
    onChange,
  }: InputControllerInterface<MediaObjectInputControllerInputInterface>) {
    return (
      <MediaObjectInputControllerView
        formInput={formInput}
        onChange={onChange}
        acceptedTypes={formInput.acceptedTypes ?? defaultAcceptedTypes}
      />
    )
  }
}

export const MediaObjectInputController = mediaObjectInputControllerFactory()

export const MediaObjectWithPdfInputController = mediaObjectInputControllerFactory({
  acceptedTypes: [...IMAGE_ACCEPTED_TYPES, PDF_ACCEPTED_TYPE],
})

export const MediaObjectDocumentInputController = mediaObjectInputControllerFactory({
  acceptedTypes: DOCUMENT_ACCEPTED_TYPES,
})

interface MediaObjectInputControllerViewProps extends InputControllerInterface<MediaObjectInputControllerInputInterface> {
  acceptedTypes: MediaObjectAcceptedFileType[]
}

const MediaObjectInputControllerView = ({
  formInput,
  onChange,
  acceptedTypes,
}: MediaObjectInputControllerViewProps) => {
  const port = useMediaObjectPort()
  const labels = useMediaObjectLabels()
  const change = (value: string | null) => {
    onChange({ ...formInput, ...{ value: value } })
  }
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState(formInput.value)
  const [previewKind, setPreviewKind] = useState<"image" | "document">("image")
  const [fileName, setFileName] = useState<string>("")
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const defaultLimit = formInput?.max ?? 10
  const MAX_FILE_SIZE = defaultLimit * 1024 * 1024
  const acceptAttribute = buildAcceptAttribute(acceptedTypes)
  const formats = acceptedTypes.map((t) => t.label).join(labels.formatSeparator)
  const canEdit = Boolean(formInput.isEditable) && previewKind === "image"
  const valueIri = getLdIri(formInput.value)

  useEffect(() => {
    if (!valueIri) return
    let cancelled = false
    port.describe(valueIri).then((media) => {
      if (cancelled) return
      setPreviewKind(resolvePreviewKind(acceptedTypes, media.mimeType ?? ""))
      if (media.label) setFileName(media.label)
    })
    return () => {
      cancelled = true
    }
  }, [valueIri, acceptedTypes, port])

  const resetInput = () => {
    setPreview(null)
    setFileName("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const matched = findAcceptedType(acceptedTypes, file)
    if (!matched) {
      resetInput()
      port.onError?.(labels.unsupportedFormat(formats))
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      resetInput()
      port.onError?.(labels.fileTooLarge(defaultLimit))
      return
    }

    // The current state is kept so it can be restored if the upload fails:
    // without it the preview would stay on screen while nothing was saved,
    // letting the user believe the picture went through.
    const previousPreview = preview
    const previousFileName = fileName

    setFileName(file.name)
    setPreviewKind(matched.preview)
    const reader = new FileReader()
    reader.onerror = (error) => {
      setPreview(previousPreview)
      setFileName(previousFileName)
      port.onError?.(labels.readFailed, error)
    }
    reader.onloadend = async () => {
      setPreview(reader.result as string)
      setIsUploading(true)
      try {
        change(
          await port.upload({
            base64: reader.result as string,
            role: formInput?.for ?? "from_user",
            gallery: formInput.gallery,
          })
        )
      } catch (error) {
        // The upload failed on the server side (validation, conversion,
        // storage…). The previous preview is restored and the user warned,
        // rather than leaving the interface showing a false success.
        setPreview(previousPreview)
        setFileName(previousFileName)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
        port.onError?.(labels.uploadFailed, error)
      } finally {
        setIsUploading(false)
      }
    }
    reader.readAsDataURL(file)
  }

  /**
   * Applies the edited image (cropped / rotated). An existing media is replaced
   * through the port — its IRI does not move, only the file changes. Without a
   * persisted media, it falls back to a plain upload.
   */
  const handleEditedImage = async (base64: string) => {
    const previousPreview = preview
    setPreview(base64)
    setIsUploading(true)
    try {
      change(
        valueIri
          ? await port.replace({ iri: valueIri, base64 })
          : await port.upload({
              base64,
              role: formInput?.for ?? "from_user",
              gallery: formInput.gallery,
            })
      )
    } catch (error) {
      setPreview(previousPreview)
      port.onError?.(labels.editFailed, error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange({ ...e, target: { files: e.dataTransfer.files } } as any)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const openEditor = (e: React.MouseEvent) => {
    e.stopPropagation() // Keeps the file input from opening
    if (isUploading) return
    setIsEditorOpen(true)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation() // Keeps the file input from opening
    if (isUploading) return
    setPreview(null)
    setFileName("")
    change(null)
    if (valueIri) {
      port
        .remove(valueIri)
        .catch((error) => port.onError?.(labels.deleteFailed, error))
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  if (formInput.readonly) {
    if (previewKind === "document") {
      return <DocumentPreview value={preview} fileName={fileName} />
    }
    return (
      <Image
        className={"aspect-square w-full max-w-md"}
        src={resolveUrl(port, preview)}
      />
    )
  }

  return (
    <>
      <div
        className={cn(
          // Responsive: width follows the surrounding grid / container
          "w-full max-w-[300px] mx-auto relative aspect-square overflow-hidden border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors",
          isDragging
            ? "border-primary bg-primary/10"
            : "border-input hover:border-primary",
          preview ? "p-0" : "p-6",
          formInput.className
        )}
        onClick={triggerFileInput}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Input
          id="image-upload"
          type="file"
          accept={acceptAttribute}
          onChange={handleFileChange}
          ref={fileInputRef}
          className="sr-only" // Hide the input visually but keep it accessible
        />

        {isUploading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/60">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}

        {preview ? (
          <>
            {previewKind === "document" ? (
              <DocumentPreview value={preview} fileName={fileName} />
            ) : (
              <Image
                src={resolveUrl(port, preview)}
                className="w-full h-full object-contain"
              />
            )}
            <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5">
              {canEdit && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="h-9 gap-1.5 px-3 shadow-md opacity-95 hover:opacity-100"
                  onClick={openEditor}
                  aria-label={labels.editAction}
                >
                  <Pencil className="h-4 w-4" />
                  {labels.edit}
                </Button>
              )}
              <Button
                variant="destructive"
                size="icon"
                className="h-9 w-9 shadow-md opacity-90 hover:opacity-100"
                onClick={handleDelete}
                aria-label={labels.deleteAction}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 text-center">
            <div className="p-3 rounded-full bg-primary/10">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">{labels.dropzoneTitle}</p>
              <p className="text-xs text-muted-foreground">
                {labels.dropzoneHint(formats, defaultLimit)}
              </p>
            </div>
          </div>
        )}
      </div>

      {canEdit && preview && isEditorOpen && (
        <ImageEditor
          src={resolveUrl(port, preview) ?? ""}
          open={isEditorOpen}
          onOpenChange={setIsEditorOpen}
          onSave={handleEditedImage}
          aspect={formInput.editorAspect ?? 1}
        />
      )}
    </>
  )
}

interface DocumentPreviewProps {
  value: string | null | undefined
  fileName?: string
}

const DocumentPreview = ({ value, fileName }: DocumentPreviewProps) => {
  const port = useMediaObjectPort()
  const labels = useMediaObjectLabels()
  const baseUrl = resolveUrl(port, value)
  // The download URL forces the file to be saved (Content-Disposition:
  // attachment on the server). Unavailable until the file is persisted.
  const downloadUrl = resolveUrl(port, value, { download: true })

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4 text-center">
      <div className="p-3 rounded-full bg-primary/10">
        <FileText className="w-8 h-8 text-primary" />
      </div>
      <p className="text-sm font-medium truncate max-w-[230px]">
        {fileName || labels.documentFallbackName}
      </p>
      <div className="flex items-center gap-3">
        {baseUrl && (
          <a
            href={baseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {labels.open}
          </a>
        )}
        {downloadUrl && (
          <a
            href={downloadUrl}
            download={fileName || true}
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            <Download className="w-3 h-3" />
            {labels.download}
          </a>
        )}
      </div>
    </div>
  )
}
