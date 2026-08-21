import { FC } from "react"
import type { Locale } from "date-fns"
import { getIdFromIri } from "jsonld-item"

/**
 * Extension points of the library.
 *
 * The library is deliberately agnostic of the application hosting it: anything
 * that assumes a router, an API or a visual identity goes through a port
 * injected at startup via {@link configurePorts}. Every port ships a default
 * implementation, so the library works with no configuration at all.
 */

/** Props of the component rendering the human-readable label of an IRI. */
export interface IriLabelPropsInterface {
  iri?: string | null
  /** Property to display on the resolved resource. Defaults to `name`. */
  property?: string
}

export interface PortsInterface {
  /**
   * Locale used to format and parse dates. Left undefined, date-fns falls back
   * to US English. Pass any date-fns locale to localise the date fields:
   *
   * ```ts
   * import { fr } from "date-fns/locale"
   * configurePorts({ dateLocale: fr })
   * ```
   */
  dateLocale?: Locale

  /**
   * BCP 47 tag used by `Intl` to format dates, times and amounts — `"fr-FR"`,
   * `"en-GB"`… Left undefined, `Intl` falls back to the runtime's own locale.
   */
  intlLocale?: string

  /**
   * ISO 4217 code of the currency used to render prices. Defaults to `"EUR"`.
   */
  currency?: string

  components: {
    /**
     * Renders the label of an IRI inside comboboxes — an IRI on its own is not
     * human-readable. The default renders the raw identifier.
     */
    iriLabel: FC<IriLabelPropsInterface>
    /** Brand mark shown at the centre of the loader. Defaults to nothing. */
    logo: FC
  }
}

const DefaultIriLabel: FC<IriLabelPropsInterface> = ({ iri }) => {
  if (!iri) return null
  return <span className={"fc"}>{getIdFromIri(iri)}</span>
}

const DefaultLogo: FC = () => null

let ports: PortsInterface = {
  currency: "EUR",
  components: {
    iriLabel: DefaultIriLabel,
    logo: DefaultLogo,
  },
}

export function getPorts(): PortsInterface {
  return ports
}

/**
 * Settings accepted by {@link configurePorts}: everything is optional, down to
 * individual components.
 */
export interface ConfigurePortsInput
  extends Partial<Omit<PortsInterface, "components">> {
  components?: Partial<PortsInterface["components"]>
}

/**
 * Wires the host application into the library. Call it once at startup, before
 * the first form is rendered.
 *
 * @example
 * configurePorts({
 *   components: { iriLabel: ResourceName, logo: BrandLogo },
 * })
 */
export function configurePorts(newPorts: ConfigurePortsInput): void {
  ports = {
    ...ports,
    ...newPorts,
    components: { ...ports.components, ...newPorts.components },
  }
}
