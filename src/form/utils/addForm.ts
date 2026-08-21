import { FormInterface } from "@/form/FormInterface"
import {
  createResource,
  resourceRegistered,
} from "resource-registry"
import {
  BaseJsonLdItemInterface,
  JsonLdIdItemInterface,
  JsonLDItem,
} from "jsonld-item"
import { searchMetaData } from "resource-registry"

type FormResource = Omit<JsonLdIdItemInterface, "@id"> & FormInterface

/** A form stored in the registry, with its JSON-LD metadata. */
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
 * Lists every form registered through {@link addForm}.
 * `fors` narrows the selection to forms exposing one of those `@for` tags.
 */
export function getForms(fors?: string[]): FormResourceItem[] {
  const forms = Object.values(resourceRegistered).filter(
    (resource) => resource["@type"] === "form"
  ) as FormResourceItem[]

  if (!fors?.length) return forms

  return forms.filter((form) => form["@for"]?.some((tag) => fors.includes(tag)))
}

/** The `type` tag to store on an item so {@link getForm} can find this form. */
export function getFormType(form: FormResourceItem): string {
  return form["@for"]?.[0] ?? form["@id"]
}

/** Human-readable label of a form, for palettes and block headers. */
export function getFormLabel(form: FormResourceItem): string {
  return form.name ?? form.label?.title ?? getFormType(form)
}
