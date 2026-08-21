import { InputControllerInterface } from "@/form/InputControllerInterface"
import { FormInputInterface } from "@/form/FormInputInterface"
import React, { FC, useEffect, useRef, useState } from "react"
import { Input } from "@/ui/input"
import { Download, FileText, Loader2, Pencil, Upload, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/ui/button"
import { Image } from "@/ui/Image"
import { getPorts } from "@/ports"
import { cn } from "@/ui/cn"
import { getIdFromIri } from "@/registry/jsonLd/getIdFromIri"
import { getLdIri } from "@/registry/jsonLd/jsonLDItem"
import { ImageEditor } from "@/media/ImageEditor"

export interface MediaObjectInputControllerInputInterface extends FormInputInterface {
  gallery?: string
  /** Types de fichiers acceptés. Défaut : images (PNG/JPG). */
  acceptedTypes?: MediaObjectAcceptedFileType[]
  /**
   * Active l'édition de l'image (recadrage + rotation) après upload. Utile
   * pour corriger les « photos de travers » (photos de profil, galeries…).
   */
  isEditable?: boolean
  /** Ratio du cadre de recadrage de l'éditeur. Défaut : 1 (carré). */
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
 * Types de fichiers acceptés pour les documents d'un rendez-vous
 * (compte rendu, examen, diplôme, etc.). On accepte les images, le PDF
 * et les formats bureautiques courants.
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

/**
 * Les champs média n'ont de sens qu'avec un backend : l'application hôte doit
 * fournir son implémentation via `configurePorts({ mediaUploader })`.
 */
const requireUploader = () => {
  const uploader = getPorts().mediaUploader
  if (!uploader) {
    throw new Error(
      "[@animalink/form] Aucun mediaUploader configuré. " +
        "Appelez configurePorts({ mediaUploader }) au démarrage de l'application."
    )
  }
  return uploader
}

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

/**
 * Fabrique un {@link FormInputInterface} pour l'upload d'un MediaObject, sur le
 * même modèle que {@link createFormResourceInput} : la factory retourne un
 * `formInput` déjà relié à son controller, prêt à être placé dans un formulaire.
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

/** Variante {@link createMediaObjectInput} acceptant aussi les PDF. */
export const createMediaObjectWithPdfInput = (
  props: MediaObjectInputControllerInputInterface = {}
): MediaObjectInputControllerInputInterface =>
  createMediaObjectInput({
    acceptedTypes: [...IMAGE_ACCEPTED_TYPES, PDF_ACCEPTED_TYPE],
    ...props,
  })

/** Variante {@link createMediaObjectInput} acceptant tous les documents. */
export const createMediaObjectDocumentInput = (
  props: MediaObjectInputControllerInputInterface = {}
): MediaObjectInputControllerInputInterface =>
  createMediaObjectInput({
    acceptedTypes: DOCUMENT_ACCEPTED_TYPES,
    ...props,
  })

/**
 * Construit un controller MediaObject avec un jeu de types acceptés par défaut.
 * Le `formInput.acceptedTypes` (fourni par la factory) reste prioritaire, ce qui
 * permet d'utiliser le composant directement (`controller: MediaObjectInputController`)
 * comme via {@link createMediaObjectInput}.
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
  const labels = acceptedTypes.map((t) => t.label).join(" ou ")
  const canEdit = Boolean(formInput.isEditable) && previewKind === "image"

  useEffect(() => {
    const iri = getLdIri(formInput.value)
    if (!iri) return
    const uploader = getPorts().mediaUploader
    if (!uploader) return
    let cancelled = false
    uploader.getMeta(iri).then((meta) => {
      if (cancelled || !meta) return
      const mime = meta.mimeType ?? ""
      const matched = acceptedTypes.find((t) => t.mime === mime)
      if (matched) {
        setPreviewKind(matched.preview)
      } else if (mime.startsWith("image/")) {
        setPreviewKind("image")
      } else {
        setPreviewKind("document")
      }
      if (meta.label) setFileName(meta.label)
    })
    return () => {
      cancelled = true
    }
  }, [])

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
      toast.error(`Format non supporté. Formats acceptés : ${labels}.`)
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      resetInput()
      toast.error(
        `Fichier trop volumineux (max. ${defaultLimit} Mo). Choisissez un fichier plus léger.`
      )
      return
    }

    // On garde l'état courant pour pouvoir le restaurer si l'upload échoue :
    // sans ça, l'aperçu resterait affiché alors que rien n'est enregistré, ce
    // qui laissait croire à l'utilisateur que la photo était bien sauvegardée.
    const previousPreview = preview
    const previousFileName = fileName

    setFileName(file.name)
    setPreviewKind(matched.preview)
    const reader = new FileReader()
    reader.onerror = () => {
      setPreview(previousPreview)
      setFileName(previousFileName)
      toast.error("Impossible de lire le fichier, veuillez réessayer.")
    }
    reader.onloadend = async () => {
      setPreview(reader.result as string)
      setIsUploading(true)
      try {
        const uploader = requireUploader()
        const iri = await uploader.upload({
          fileInBase64: reader.result as string,
          role: formInput?.for ?? "from_user",
          gallery: formInput.gallery,
        })

        change(iri)
      } catch {
        // L'upload a échoué côté serveur (validation, conversion WebP, S3...).
        // On restaure l'aperçu précédent et on prévient l'utilisateur au lieu
        // de laisser l'interface afficher un faux succès.
        setPreview(previousPreview)
        setFileName(previousFileName)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
        toast.error("L'enregistrement de la photo a échoué. Veuillez réessayer.")
      } finally {
        setIsUploading(false)
      }
    }
    reader.readAsDataURL(file)
  }

  /**
   * Applique l'image éditée (recadrée / pivotée). On remplace le MediaObject
   * existant via PATCH — l'IRI reste identique, seul le fichier change côté S3.
   * En l'absence de média persisté, on retombe sur un POST classique.
   */
  const handleEditedImage = async (base64: string) => {
    const iri = getLdIri(formInput.value)
    const previousPreview = preview
    setPreview(base64)
    setIsUploading(true)
    try {
      const uploader = requireUploader()
      if (iri) {
        change(await uploader.update(iri, { fileInBase64: base64 }))
      } else {
        change(
          await uploader.upload({
            fileInBase64: base64,
            role: formInput?.for ?? "from_user",
            gallery: formInput.gallery,
          })
        )
      }
    } catch {
      setPreview(previousPreview)
      toast.error("La modification de la photo a échoué. Veuillez réessayer.")
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
    e.stopPropagation() // Empêche le déclenchement du file input
    if (isUploading) return
    setIsEditorOpen(true)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation() // Empêche le déclenchement du file input
    if (isUploading) return
    setPreview(null)
    setFileName("")
    change(null)
    const uploader = getPorts().mediaUploader
    if (formInput.value && uploader) {
      uploader.remove(formInput.value).then((replacementIri) => {
        if (replacementIri) change(replacementIri)
      })
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  if (formInput.readonly) {
    if (previewKind === "document") {
      return <DocumentPreview value={preview} fileName={fileName} />
    }
    return <Image className={"aspect-square w-full max-w-md"} src={preview} />
  }

  return (
    <>
      <div
        className={cn(
          // responsive: largeur flexible selon ta grid/container
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
              <Image src={preview} className="w-full h-full object-contain" />
            )}
            <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5">
              {canEdit && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="h-9 gap-1.5 px-3 shadow-md opacity-95 hover:opacity-100"
                  onClick={openEditor}
                  aria-label="Modifier la photo"
                >
                  <Pencil className="h-4 w-4" />
                  Modifier
                </Button>
              )}
              <Button
                variant="destructive"
                size="icon"
                className="h-9 w-9 shadow-md opacity-90 hover:opacity-100"
                onClick={handleDelete}
                aria-label="Supprimer la photo"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center justify-center gap-2 text-center">
              <div className="p-3 rounded-full bg-primary/10">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  Cliquez ou déposez un fichier ici
                </p>
                <p className="text-xs text-muted-foreground">
                  {labels} (max. {defaultLimit}MB)
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {canEdit && preview && isEditorOpen && (
        <ImageEditor
          src={getPorts().mediaUrlResolver(preview)}
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
  const isDataUrl = typeof value === "string" && value.startsWith("data:")
  const baseUrl = (() => {
    if (!value) return undefined
    if (isDataUrl) return value
    const iri = getLdIri(value)
    if (!iri) return undefined
    return `/api/public/media_object/image-id/${getIdFromIri(iri)}`
  })()

  // L'URL de téléchargement force la sauvegarde du fichier (Content-Disposition:
  // attachment côté serveur). Indisponible tant que le fichier n'est pas persisté.
  const downloadUrl = baseUrl && !isDataUrl ? `${baseUrl}?download=1` : undefined

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4 text-center">
      <div className="p-3 rounded-full bg-primary/10">
        <FileText className="w-8 h-8 text-primary" />
      </div>
      <p className="text-sm font-medium truncate max-w-[230px]">
        {fileName || "Document"}
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
            Ouvrir
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
            Télécharger
          </a>
        )}
      </div>
    </div>
  )
}
