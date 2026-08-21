import ViolationInterface from "@/form/Violation"

/**
 * Error returned by an API Platform backend as `application/problem+json`.
 * Redefined here so the library needs nothing from the host application's HTTP
 * client — only the shape of the response matters.
 */
export interface ApiJsonLdError {
  readonly title?: string | null
  readonly detail?: string | null
  /** @default 400 */
  status?: number
  readonly instance?: string | null
  readonly type?: string
  readonly description?: string | null
  readonly violations?: ViolationInterface[]
}
