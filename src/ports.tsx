import { FC } from "react"
import { BaseJsonLdItemInterface, getLdIri } from "@/registry/jsonLd/jsonLDItem"
import isApiIri from "@/registry/jsonLd/isApiIri"
import { getIdFromIri } from "@/registry/jsonLd/getIdFromIri"

/**
 * Points d'extension de la librairie.
 *
 * La librairie est volontairement agnostique de l'application qui l'héberge :
 * tout ce qui suppose un backend, un routeur ou une identité visuelle passe par
 * un port injecté au démarrage via {@link configurePorts}. Chaque port possède
 * une implémentation par défaut utilisable telle quelle, à l'exception de
 * {@link MediaUploaderInterface} qui n'a de sens qu'avec une vraie API.
 */

/** Métadonnées d'un média, telles que retournées par l'API hôte. */
export interface MediaObjectMetaInterface {
  mimeType?: string | null
  label?: string | null
}

/**
 * Contrat d'upload utilisé par `MediaObjectInputController`.
 *
 * Chaque méthode renvoie l'IRI du média manipulé, que le formulaire stocke
 * comme valeur du champ.
 */
export interface MediaUploaderInterface {
  /** Envoie un nouveau fichier (base64) et retourne l'IRI créée. */
  upload(input: {
    fileInBase64: string
    role?: string
    gallery?: string
  }): Promise<string>

  /** Remplace le fichier d'un média existant sans changer son IRI. */
  update(iri: string, input: { fileInBase64: string }): Promise<string>

  /** Supprime un média. Peut retourner une IRI de remplacement. */
  remove(iri: string): Promise<string | void>

  /** Lit les métadonnées d'un média pour choisir le type d'aperçu. */
  getMeta(iri: string): Promise<MediaObjectMetaInterface | null>
}

/** Props du composant chargé d'afficher le libellé lisible d'une IRI. */
export interface IriLabelPropsInterface {
  iri?: string | null
  /** Propriété à afficher dans la ressource résolue. Défaut : `name`. */
  property?: string
}

export interface PortsInterface {
  /**
   * Résout un média (IRI ou objet JSON-LD) en URL affichable.
   * Le défaut suit la convention API Platform d'Animalink.
   */
  mediaUrlResolver: (
    content: string | BaseJsonLdItemInterface | undefined | null
  ) => string

  /**
   * Implémentation de l'upload de médias. Sans elle, les champs média
   * restent lisibles mais refusent toute écriture.
   */
  mediaUploader?: MediaUploaderInterface

  components: {
    /**
     * Rend le libellé d'une IRI dans les combobox (une IRI seule n'est pas
     * lisible par un humain). Le défaut affiche l'identifiant brut.
     */
    iriLabel: FC<IriLabelPropsInterface>
    /** Marque affichée au centre du loader. Défaut : rien. */
    logo: FC
  }
}

const defaultMediaUrlResolver = (
  content: string | BaseJsonLdItemInterface | undefined | null
): string => {
  if (!content) return "https://placehold.co/300x300?text=IMG"

  const iri = getLdIri(content)
  if (!iri) return "https://placehold.co/300x300?text=IMG"

  if (iri.includes("image-name")) return iri

  if (isApiIri(iri)) {
    return "/api/public/media_object/image-id/" + getIdFromIri(iri)
  }

  return iri
}

const DefaultIriLabel: FC<IriLabelPropsInterface> = ({ iri }) => {
  if (!iri) return null
  return <span className={"fc"}>{getIdFromIri(iri)}</span>
}

const DefaultLogo: FC = () => null

let ports: PortsInterface = {
  mediaUrlResolver: defaultMediaUrlResolver,
  components: {
    iriLabel: DefaultIriLabel,
    logo: DefaultLogo,
  },
}

export function getPorts(): PortsInterface {
  return ports
}

/**
 * Réglages acceptés par {@link configurePorts} : tout est facultatif, y compris
 * les composants pris un par un.
 */
export interface ConfigurePortsInput
  extends Partial<Omit<PortsInterface, "components">> {
  components?: Partial<PortsInterface["components"]>
}

/**
 * Branche l'application hôte sur la librairie. À appeler une fois au démarrage,
 * avant le premier rendu d'un formulaire.
 *
 * @example
 * configurePorts({
 *   mediaUploader: animalinkMediaUploader,
 *   components: { iriLabel: ApiUri },
 * })
 */
export function configurePorts(newPorts: ConfigurePortsInput): void {
  ports = {
    ...ports,
    ...newPorts,
    components: { ...ports.components, ...newPorts.components },
  }
}
