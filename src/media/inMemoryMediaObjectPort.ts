import {
  MediaObjectGalleryInterface,
  MediaObjectPortInterface,
} from "@/media/MediaObjectPortInterface"

export interface InMemoryMediaObjectInterface {
  iri: string
  base64: string
  mimeType?: string
  label?: string
  role?: string
}

export interface InMemoryMediaObjectGalleryInterface extends MediaObjectGalleryInterface {
  role?: string
}

export interface InMemoryMediaObjectPortInterface extends MediaObjectPortInterface {
  /** Media stored so far, by IRI. */
  readonly medias: Map<string, InMemoryMediaObjectInterface>
  /** Galleries created so far, by IRI. */
  readonly galleries: Map<string, InMemoryMediaObjectGalleryInterface>
}

export interface InMemoryMediaObjectPortOptions {
  /** Prefix of the generated IRIs. Defaults to `/media_objects/`. */
  prefix?: string
  onError?: MediaObjectPortInterface["onError"]
}

const mimeTypeOf = (base64: string): string | undefined =>
  base64.match(/^data:([^;,]+)/)?.[1]

/**
 * A port that keeps everything in memory, with no server behind it: enough to
 * run the media controllers in a test, a story or a documentation page.
 *
 * @example
 * <MediaObjectProvider port={createInMemoryMediaObjectPort()}>
 */
export function createInMemoryMediaObjectPort(
  options: InMemoryMediaObjectPortOptions = {}
): InMemoryMediaObjectPortInterface {
  const prefix = options.prefix ?? "/media_objects/"
  const medias = new Map<string, InMemoryMediaObjectInterface>()
  const galleries = new Map<string, InMemoryMediaObjectGalleryInterface>()
  let sequence = 0

  const nextIri = (kind: string) => `${prefix}${kind}${++sequence}`

  const requireMedia = (iri: string): InMemoryMediaObjectInterface => {
    const media = medias.get(iri)
    if (!media) throw new Error(`Unknown media object: ${iri}`)
    return media
  }

  return {
    medias,
    galleries,
    onError: options.onError,

    async upload({ base64, role, gallery }) {
      const iri = nextIri("")
      medias.set(iri, { iri, base64, mimeType: mimeTypeOf(base64), role })
      if (gallery) {
        const stored = galleries.get(gallery)
        if (stored) stored.items = [...stored.items, iri]
      }
      return iri
    },

    async replace({ iri, base64 }) {
      const media = requireMedia(iri)
      media.base64 = base64
      media.mimeType = mimeTypeOf(base64)
      return iri
    },

    async remove(iri) {
      medias.delete(iri)
      galleries.forEach((gallery) => {
        gallery.items = gallery.items.filter((item) => item !== iri)
      })
    },

    async describe(iri) {
      const media = requireMedia(iri)
      return { mimeType: media.mimeType, label: media.label }
    },

    toUrl(iri) {
      if (!iri) return undefined
      // A data URL is displayable and downloadable as is: the same URL serves
      // both cases.
      return medias.get(iri)?.base64
    },

    gallery: {
      async create({ role }) {
        const gallery: InMemoryMediaObjectGalleryInterface = {
          iri: nextIri("galleries/"),
          items: [],
          role,
        }
        galleries.set(gallery.iri, gallery)
        return { ...gallery }
      },

      async read(iri) {
        const gallery = galleries.get(iri)
        if (!gallery) throw new Error(`Unknown gallery: ${iri}`)
        return { ...gallery }
      },
    },
  }
}
