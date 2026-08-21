import { JsonLDItem, JsonLdType } from "@/registry/jsonLd/jsonLDItem"
import { createJsonLdIri } from "@/registry/jsonLd/createJsonLdIri"
import { getIdFromIri } from "@/registry/jsonLd/getIdFromIri"

export function createJsonLd<T extends object = any>({
  type,
  object,
}: {
  type: JsonLdType
  object: T
}): JsonLDItem<T> {
  const jsonLdType = type

  // @ts-expect-error id may not exist on T
  const id = Object.hasOwn(object, "id") && object.id ? object.id : undefined

  const iri = createJsonLdIri(jsonLdType, id)

  const item = {
    "@id": iri.startsWith("/") ? iri : "/" + iri,
    "@type": jsonLdType,
    "@context": jsonLdType,
    ...object,
  }

  // @ts-expect-error id is derived from the generated @id IRI
  item["id"] = getIdFromIri(item["@id"])

  return item
}
