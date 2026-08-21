import { IdAbleInterface } from "@/registry/jsonLd/jsonLDItem"
import { getIdFromIri } from "@/registry/jsonLd/getIdFromIri"

export default function getIdFromObject(
  object: IdAbleInterface,
  forceId: boolean = false
): string | undefined {
  if (object["@id"]) {
    if (forceId) {
      return getIdFromIri(object["@id"])
    }
    return object["@id"]
  }

  return object["id"] ?? undefined
}
