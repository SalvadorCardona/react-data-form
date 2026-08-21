export default function isApiIri(uri: string | unknown): boolean {
  if (typeof uri !== "string") return false

  return uri.startsWith("/api/")
}
