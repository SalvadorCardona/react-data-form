import { BaseJsonLdItemInterface, getLdIri } from "jsonld-item"
import { isApiIri } from "jsonld-item"
import { getIdFromIri } from "jsonld-item"

export const mediaObjetToUrl = (
  content: string | BaseJsonLdItemInterface | undefined | null
) => {
  if (!content) return "https://placehold.co/300x300?text=IMG"

  const iri = getLdIri(content)
  if (!iri) {
    return "https://placehold.co/300x300?text=IMG"
  }

  if (iri.includes("image-name")) {
    return iri
  }

  if (isApiIri(iri)) {
    const id = getIdFromIri(iri)
    return "/api/public/media_object/image-id/" + id
  }

  return iri
}
