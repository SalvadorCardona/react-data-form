import { createContext, createElement, PropsWithChildren, use, useMemo } from "react"

/**
 * The single contact point between the media controllers and the application
 * hosting them.
 *
 * The library knows how to render an upload, a preview and a gallery; it knows
 * nothing about the API behind them — no route, no payload, no authentication.
 * The application implements this port and injects it through
 * {@link MediaObjectProvider}; the controllers only ever call it.
 */
export interface MediaObjectPortInterface {
  /** Creates a media from a base64 data URL. Returns its IRI. */
  upload(input: { base64: string; role?: string; gallery?: string }): Promise<string>
  /** Replaces the file of an existing media; the IRI does not change. */
  replace(input: { iri: string; base64: string }): Promise<string>
  /** Deletes a media. */
  remove(iri: string): Promise<void>
  /** Metadata used by the preview: MIME type and file name. */
  describe(iri: string): Promise<{ mimeType?: string; label?: string }>
  /** Displayable URL (and its download variant) for an IRI. */
  toUrl(
    iri: string | null | undefined,
    options?: { download?: boolean }
  ): string | undefined
  /** The gallery: creation, reading of its items. */
  gallery: {
    create(input: { role?: string }): Promise<MediaObjectGalleryInterface>
    read(iri: string): Promise<MediaObjectGalleryInterface>
  }
  /**
   * Called whenever an operation fails, with a message already translated
   * through {@link MediaObjectLabelsInterface}. The library ships no toast of
   * its own: plug your own notification system here.
   *
   * @example
   * onError: (message) => toast.error(message)
   */
  onError?(message: string, error?: unknown): void
}

/** A gallery, reduced to what the controllers need: its IRI and its media. */
export interface MediaObjectGalleryInterface {
  iri: string
  items: string[]
}

/**
 * Every string displayed by the media controllers. Defaults are English — the
 * library is published in English — and each one can be overridden on the
 * provider.
 */
export interface MediaObjectLabelsInterface {
  /** Joins the accepted format labels together: `"PNG or JPG"`. */
  formatSeparator: string
  unsupportedFormat: (formats: string) => string
  fileTooLarge: (maxSizeInMb: number) => string
  readFailed: string
  uploadFailed: string
  editFailed: string
  deleteFailed: string
  edit: string
  editAction: string
  deleteAction: string
  dropzoneTitle: string
  dropzoneHint: (formats: string, maxSizeInMb: number) => string
  documentFallbackName: string
  open: string
  download: string
  loading: string
  galleryCreating: string
  galleryCreateTitle: string
  galleryCreateHint: string
  galleryCreateFailed: string
  galleryLoadFailed: string
  galleryEmptyTitle: string
  galleryEmptyHint: string
  retry: string
}

export const defaultMediaObjectLabels: MediaObjectLabelsInterface = {
  formatSeparator: " or ",
  unsupportedFormat: (formats) =>
    `Unsupported format. Accepted formats: ${formats}.`,
  fileTooLarge: (maxSizeInMb) =>
    `File too large (max. ${maxSizeInMb} MB). Please choose a lighter file.`,
  readFailed: "Could not read the file, please try again.",
  uploadFailed: "Saving the file failed. Please try again.",
  editFailed: "Editing the image failed. Please try again.",
  deleteFailed: "Deleting the file failed. Please try again.",
  edit: "Edit",
  editAction: "Edit the picture",
  deleteAction: "Delete the picture",
  dropzoneTitle: "Click or drop a file here",
  dropzoneHint: (formats, maxSizeInMb) => `${formats} (max. ${maxSizeInMb}MB)`,
  documentFallbackName: "Document",
  open: "Open",
  download: "Download",
  loading: "Loading...",
  galleryCreating: "Creating...",
  galleryCreateTitle: "Click to upload",
  galleryCreateHint: " or drag and drop",
  galleryCreateFailed: "Could not create the gallery",
  galleryLoadFailed: "Could not load the gallery",
  galleryEmptyTitle: "No media in this gallery",
  galleryEmptyHint: "Add your first media by clicking the button above",
  retry: "Retry",
}

interface MediaObjectContextInterface {
  port: MediaObjectPortInterface
  labels: MediaObjectLabelsInterface
}

const MediaObjectContext = createContext<MediaObjectContextInterface | null>(null)

export interface MediaObjectProviderPropsInterface extends PropsWithChildren {
  port: MediaObjectPortInterface
  /** Overrides of the English defaults, label by label. */
  labels?: Partial<MediaObjectLabelsInterface>
}

/**
 * Injects the port used by the media controllers. A provider rather than a
 * global singleton: it is testable, it is mocked in a single line, and two
 * ports can live side by side — the application and a demo, for instance.
 *
 * @example
 * <MediaObjectProvider port={mediaObjectPort} labels={{ edit: "Modifier" }}>
 *   <App />
 * </MediaObjectProvider>
 */
export function MediaObjectProvider({
  port,
  labels,
  children,
}: MediaObjectProviderPropsInterface) {
  const value = useMemo(
    () => ({ port, labels: { ...defaultMediaObjectLabels, ...labels } }),
    [port, labels]
  )

  // JSX is out of reach in this `.ts` file: since React 19 a context renders
  // as its own provider, so `createElement` is enough.
  return createElement(MediaObjectContext, { value }, children)
}

function useMediaObjectContext(): MediaObjectContextInterface {
  const context = use(MediaObjectContext)
  if (!context) {
    throw new Error(
      "No MediaObjectProvider found. Wrap your application in " +
        "<MediaObjectProvider port={…}> so the media controllers can reach your API."
    )
  }
  return context
}

/** The port injected by the application. Throws outside of a provider. */
export function useMediaObjectPort(): MediaObjectPortInterface {
  return useMediaObjectContext().port
}

/** The labels of the provider, already merged with the English defaults. */
export function useMediaObjectLabels(): MediaObjectLabelsInterface {
  return useMediaObjectContext().labels
}
