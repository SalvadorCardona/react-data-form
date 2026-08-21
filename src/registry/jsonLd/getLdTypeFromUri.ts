import { JsonLdIri, JsonLdType } from "@/registry/jsonLd/jsonLDItem"

export function getLdTypeFromUri(uri: JsonLdIri): JsonLdType | undefined {
  // Découpe l'URI en segments en se basant sur le séparateur "/"
  const segments = uri.split("/")
  // Retire le dernier segment (l'ID) et reconstruit l'URI
  return segments.slice(0, -1).join("/")
}
