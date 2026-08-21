import {
  BaseJsonLdItemInterface,
  JsonLdIri,
  JsonLDItem,
  JsonLdType,
} from "@/registry/jsonLd/jsonLDItem"
import { createJsonLd } from "@/registry/jsonLd/createJsonLd"

export interface JsonLdCollection<
  T = BaseJsonLdItemInterface,
> extends BaseJsonLdItemInterface {
  "@id": JsonLdIri
  "@type": JsonLdType
  "@context"?: string
  member: JsonLDItem<T>[]
  totalItems?: number
}

export function createJsonLdCollection<T = BaseJsonLdItemInterface>({
  type,
  member,
}: {
  type: JsonLdType
  member?: JsonLDItem<T>[]
}): JsonLdCollection<T> {
  return createJsonLd<JsonLdCollection<T>>({
    type,
    object: {
      "@id": type,
      "@context": type,
      "@type": "Collection",
      member: member ?? [],
      totalItems: (member ?? []).length,
    },
  })
}

export function getItems<T = JsonLDItem<any>>(
  collection: JsonLdCollection<T>
): JsonLDItem<T>[] {
  return collection?.member ?? []
}
