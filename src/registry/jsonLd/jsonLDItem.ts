export type JsonLdIri = string
export type JsonLdType = string

export interface JsonLdIriContainerInterface<T = object> {
  [key: JsonLdIri]: JsonLDItem<T>
}

export interface JsonLdTypeItemInterface {
  "@type": JsonLdType
}

export interface JsonLdIdItemInterface {
  "@id": JsonLdType
  [key: string]: any
}

export interface IdAbleInterface {
  "@id"?: JsonLdIri | null
  id?: string | null

  [key: string]: any
}

export interface BaseJsonLdItemInterface {
  "@id": JsonLdIri
  "@type"?: JsonLdType

  [key: string]: any
}

export type JsonLDItem<T> = BaseJsonLdItemInterface & T

export function isJsonLdItem(subject: object): subject is BaseJsonLdItemInterface {
  return typeof subject === "object" && Object.hasOwn(subject, "@id")
}

export function isJsonLdTypeItem(
  subject: object
): subject is JsonLdTypeItemInterface {
  return typeof subject === "object" && Object.hasOwn(subject, "@type")
}

export type JsonLdTypeAble = JsonLdType | JsonLDItem<any>

export function getLdType(item: JsonLdTypeAble): undefined | JsonLdType {
  if (typeof item === "string") return item

  if (isJsonLdTypeItem(item)) return item["@type"]

  return undefined
}

export type JsonLdIriAble = JsonLdIri | JsonLDItem<any>

export function getLdIri(item?: JsonLdIriAble): JsonLdIri | undefined {
  if (typeof item === "string") return item

  if (isJsonLdItem(item)) return item["@id"]

  return undefined
}
