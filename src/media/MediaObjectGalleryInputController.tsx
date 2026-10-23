import { FC, useEffect, useMemo, useState } from "react"
import { getLdIri } from "jsonld-item"
import { AlertCircle, Loader2, Upload } from "lucide-react"
import type { InputControllerInterface } from "@/form/InputControllerInterface"
import type { FormInputInterface } from "@/form/FormInputInterface"
import { Item, ItemContent } from "@/ui/item"
import { cn } from "@/ui/cn"
import {
  DOCUMENT_ACCEPTED_TYPES,
  MediaObjectAcceptedFileType,
  MediaObjectDocumentInputController,
  MediaObjectInputController,
} from "@/media/MediaObjectInputController"
import {
  MediaObjectGalleryInterface,
  useMediaObjectLabels,
  useMediaObjectPort,
} from "@/media/MediaObjectPortInterface"

export interface MediaObjectGalleryInputControllerInputInterface extends FormInputInterface<
  string | null | undefined
> {
  /**
   * Extensions accepted for the media of the gallery (`"png"` or `".png"`).
   * Only the known formats ({@link DOCUMENT_ACCEPTED_TYPES}) are kept; without
   * any, the item controller keeps its own defaults.
   */
  allowedExtension?: string[]
}

const toAcceptedTypes = (
  extensions: string[] | undefined
): MediaObjectAcceptedFileType[] | undefined => {
  const wanted = (extensions ?? []).map(
    (ext) => "." + ext.replace(/^\./, "").toLowerCase()
  )
  const types = DOCUMENT_ACCEPTED_TYPES.filter((t) =>
    t.extensions.some((ext) => wanted.includes(ext))
  )
  return types.length > 0 ? types : undefined
}

export interface MediaObjectGalleryInputControllerOptions {
  /** Controller used for each media of the gallery (image by default). */
  itemController?: FC<InputControllerInterface<any>>
  /** Role given to the created gallery. */
  role?: string
}

export const mediaObjectGalleryInputControllerFactory = (
  options: MediaObjectGalleryInputControllerOptions = {}
): FC<InputControllerInterface<MediaObjectGalleryInputControllerInputInterface>> => {
  const ItemController = options.itemController ?? MediaObjectInputController
  // A role is an identifier the API gives meaning to, not a label: the default
  // is the one the applications already store.
  const galleryRole = options.role ?? "galeries"

  return function MediaObjectGalleryInputControllerVariant(props) {
    return (
      <MediaObjectGalleryInputControllerView
        {...props}
        itemController={ItemController}
        galleryRole={galleryRole}
      />
    )
  }
}

interface MediaObjectGalleryInputControllerViewProps extends InputControllerInterface<MediaObjectGalleryInputControllerInputInterface> {
  itemController: FC<InputControllerInterface<any>>
  galleryRole: string
}

const MediaObjectGalleryInputControllerView = ({
  formInput,
  onChange,
  itemController: ItemController,
  galleryRole,
}: MediaObjectGalleryInputControllerViewProps) => {
  const port = useMediaObjectPort()
  const labels = useMediaObjectLabels()
  const valueIri = getLdIri(formInput.value ?? undefined)
  // IRI of the gallery just created, until the value catches up with it.
  const [createdUri, setCreatedUri] = useState<string>()
  const [previousValueIri, setPreviousValueIri] = useState(valueIri)
  if (valueIri !== previousValueIri) {
    setPreviousValueIri(valueIri)
    setCreatedUri(undefined)
  }
  const uri = createdUri ?? valueIri
  const [loadedGallery, setGallery] = useState<MediaObjectGalleryInterface>()
  // A gallery loaded for a previous IRI is not shown for the current one.
  const gallery = loadedGallery?.iri === uri ? loadedGallery : undefined
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Keyed on the extensions themselves: a new array on every render would
  // reload each item's description.
  const allowedExtensionKey = formInput.allowedExtension?.join(",")
  const acceptedTypes = useMemo(
    () => toAcceptedTypes(allowedExtensionKey?.split(",")),
    [allowedExtensionKey]
  )

  async function createGallery() {
    setIsLoading(true)
    setError(null)
    try {
      const created = await port.gallery.create({ role: galleryRole })
      setCreatedUri(created.iri)
      setGallery(created)
      onChange({ ...formInput, ...{ value: created.iri } })
    } catch (err) {
      setError(labels.galleryCreateFailed)
      port.onError?.(labels.galleryCreateFailed, err)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshGallery = async () => {
    if (!uri) return

    setIsLoading(true)
    setError(null)
    try {
      const refreshed = await port.gallery.read(uri)
      setGallery(refreshed)
      onChange({ ...formInput, ...{ value: refreshed.iri } })
    } catch (err) {
      setError(labels.galleryLoadFailed)
      port.onError?.(labels.galleryLoadFailed, err)
    } finally {
      setIsLoading(false)
    }
  }

  // A deleted media leaves the list at once: reading the gallery now would
  // race the removal still running on the port and bring the media back.
  const onItemChange = (item: string, value: unknown) => {
    if (value === null && gallery) {
      setGallery({ ...gallery, items: gallery.items.filter((e) => e !== item) })
      return
    }
    refreshGallery()
  }

  // Loads the gallery already attached to the field: only its IRI matters here.
  useEffect(() => {
    if (uri && !gallery) {
      let cancelled = false
      port.gallery.read(uri).then(
        (read) => {
          if (cancelled) return
          setError(null)
          setGallery(read)
        },
        (err) => {
          if (cancelled) return
          setError(labels.galleryLoadFailed)
          port.onError?.(labels.galleryLoadFailed, err)
        }
      )
      return () => {
        cancelled = true
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uri])

  if (isLoading && !gallery) {
    return (
      <Item variant={"outline"}>
        <ItemContent className="p-8">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-10 h-10 text-muted-foreground animate-spin" />
            <p className="text-sm text-muted-foreground">{labels.loading}</p>
          </div>
        </ItemContent>
      </Item>
    )
  }

  if (error && !gallery) {
    return (
      <Item variant={"outline"}>
        <ItemContent className="p-8">
          <div className="flex flex-col items-center gap-2">
            <AlertCircle className="w-10 h-10 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
            <button
              type="button"
              onClick={uri ? refreshGallery : createGallery}
              className="text-sm text-primary hover:underline"
            >
              {labels.retry}
            </button>
          </div>
        </ItemContent>
      </Item>
    )
  }

  // Read only: the thumbnails, nothing that writes through the port.
  if (formInput.readonly && !uri) {
    return (
      <Item variant={"outline"}>
        <ItemContent className="p-8">
          <p className="text-sm text-center text-muted-foreground">
            {labels.galleryEmptyTitle}
          </p>
        </ItemContent>
      </Item>
    )
  }

  if (!uri) {
    return (
      <Item
        render={<button type="button" disabled={isLoading} />}
        id={formInput.id}
        onClick={createGallery}
        aria-busy={isLoading}
        variant={"outline"}
        className={cn(
          "cursor-pointer hover:bg-accent/50 transition-colors",
          isLoading && "cursor-not-allowed opacity-50"
        )}
      >
        <ItemContent className="p-8">
          <div className="flex flex-col items-center gap-2">
            {isLoading ? (
              <Loader2 className="w-10 h-10 text-muted-foreground animate-spin" />
            ) : (
              <Upload className="w-10 h-10 text-muted-foreground" />
            )}
            <div className="text-sm text-center">
              <span className="font-medium text-foreground">
                {isLoading ? labels.galleryCreating : labels.galleryCreateTitle}
              </span>
            </div>
            {!isLoading &&
              formInput?.allowedExtension &&
              formInput.allowedExtension.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {formInput.allowedExtension.join(", ").toUpperCase()}
                </p>
              )}
          </div>
        </ItemContent>
      </Item>
    )
  }

  const hasItems = gallery?.items && gallery.items.length > 0

  return (
    <Item variant={"outline"} className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      )}

      <ItemContent
        className={cn(
          "grid gap-4 p-4",
          "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        )}
      >
        {hasItems &&
          (gallery?.items ?? []).map((e) => (
            <ItemController
              key={"item-gallery-" + e}
              formInput={{
                value: e,
                gallery: uri,
                readonly: formInput.readonly,
                acceptedTypes,
                // A media belongs to the gallery on the server: letting go of
                // it only in the form would leave it there.
                deleteOn: "immediate",
              }}
              onChange={(changed) => onItemChange(e, changed.value)}
            />
          ))}

        {!formInput.readonly && (
          <ItemController
            key={
              (gallery?.items?.length ?? "") + (gallery?.iri ?? "") + "item-galery"
            }
            formInput={{
              value: undefined,
              for: "gallery",
              gallery: uri,
              acceptedTypes,
            }}
            onChange={() => refreshGallery()}
          />
        )}

        {!hasItems && !isLoading && (
          <div className="col-span-full flex flex-col items-center justify-center py-8 text-center">
            <Upload className="w-12 h-12 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">
              {labels.galleryEmptyTitle}
            </p>
            {!formInput.readonly && (
              <p className="text-xs text-muted-foreground">
                {labels.galleryEmptyHint}
              </p>
            )}
          </div>
        )}
      </ItemContent>

      {error && gallery && (
        <div className="px-4 pb-4">
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-2 rounded">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      )}
    </Item>
  )
}

/** Image gallery (default variant). */
export const MediaObjectGalleryInputController =
  mediaObjectGalleryInputControllerFactory()

/**
 * Document gallery: accepts images, PDF and office formats — to attach
 * documents to a resource.
 */
export const MediaObjectDocumentGalleryInputController =
  mediaObjectGalleryInputControllerFactory({
    itemController: MediaObjectDocumentInputController,
    role: "documents",
  })
