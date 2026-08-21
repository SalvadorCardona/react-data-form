import createUniqId from "@/internal/utils/id/createUniqId"
import { JsonLdIri, JsonLdType } from "@/registry/jsonLd/jsonLDItem"

export function createJsonLdIri(baseType: JsonLdType, id?: string): JsonLdIri {
  return baseType + "/" + (id ?? createUniqId())
}
