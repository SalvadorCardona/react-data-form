import ViolationInterface from "@/form/Violation"

/**
 * Erreur renvoyée par une API Platform au format `application/problem+json`.
 * Redéfinie ici pour que la librairie n'ait pas besoin du client HTTP de
 * l'application hôte : seule la forme de la réponse compte.
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
