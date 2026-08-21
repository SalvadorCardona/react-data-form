import { FormInterface } from "@/form/FormInterface"
import {
  createResource,
  resourceRegistered,
} from "@/registry/ResourceInterface"
import {
  BaseJsonLdItemInterface,
  JsonLdIdItemInterface,
  JsonLDItem,
} from "@/registry/jsonLd/jsonLDItem"
import { searchMetaData } from "@/registry/SearchMetaData"

type FormResource = Omit<JsonLdIdItemInterface, "@id"> & FormInterface

/** Formulaire enregistré dans le registre (avec ses métadonnées JSON-LD). */
export type FormResourceItem = JsonLDItem<FormInterface> & {
  "@for"?: string[]
}

export function addForm(name: string, form: FormResource): FormInterface {
  const formResource = form as FormResource & JsonLdIdItemInterface
  formResource["@id"] = name
  formResource["@type"] = "form"
  return createResource<JsonLDItem<FormInterface>>(
    name,
    formResource as BaseJsonLdItemInterface
  )
}

export function getForm({ type }: { type: string }) {
  return searchMetaData<JsonLDItem<FormInterface>>({
    "@id": "",
    "@type": "form",
    "@for": [type],
  })
}

/**
 * Liste tous les formulaires enregistrés via {@link addForm}.
 * `fors` restreint la sélection aux formulaires exposant l'un de ces tags `@for`.
 */
export function getForms(fors?: string[]): FormResourceItem[] {
  const forms = Object.values(resourceRegistered).filter(
    (resource) => resource["@type"] === "form"
  ) as FormResourceItem[]

  if (!fors?.length) return forms

  return forms.filter((form) => form["@for"]?.some((tag) => fors.includes(tag)))
}

/** Tag `type` à stocker dans un item pour retrouver ce formulaire via {@link getForm}. */
export function getFormType(form: FormResourceItem): string {
  return form["@for"]?.[0] ?? form["@id"]
}

/** Libellé lisible d'un formulaire pour l'affichage (palette, en-tête de bloc…). */
export function getFormLabel(form: FormResourceItem): string {
  return form.name ?? form.label?.title ?? getFormType(form)
}
