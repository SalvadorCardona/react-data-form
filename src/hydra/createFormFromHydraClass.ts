import { FormInputInterface } from "@/form/FormInputInterface"
import { FormInterface } from "@/form/FormInterface"
import { InputControllerComponentInterface } from "@/form/InputControllerInterface"
import { ValueOptionInterface } from "@/form/utils/valueOption"
import { DatePickerInputController } from "@/form/component/InputController/DatePickerInputController"
import { DefaultInputController } from "@/form/component/InputController/DefaultInputController"
import { MultiSelectSearchInputController } from "@/form/component/InputController/MultiSelectSearchInputController"
import { NumberInputController } from "@/form/component/InputController/NumberInputController"
import { SelectSearchInputController } from "@/form/component/InputController/SelectSearchInputController"
import { SwitchInputController } from "@/form/component/InputController/SwitchInputController"

/**
 * The Hydra documentation of an API, as served by API Platform on
 * `/api/docs.jsonld`: compacted JSON-LD, with or without the `hydra:` prefix.
 */
export type HydraDocumentation = Record<string, any>

/** A field pointing to another class of the API. */
export interface HydraRelation {
  /** Name of the field, `book`. */
  name: string
  /** IRI of the class it points to, `#Book`. */
  range: string
  /** A collection (`owl:maxCardinality` other than 1): several IRIs. */
  multiple: boolean
}

export interface HydraFormOptions {
  /**
   * Searches the items a relation may point to: the library knows nothing of
   * the API behind them. Without it, a relation offers its current value only.
   */
  onSearch?: (
    query: string,
    relation: HydraRelation
  ) => Promise<ValueOptionInterface[]>
  /**
   * Per field, merged over what the documentation gives; `false` leaves the
   * field out. A field the documentation does not describe is added.
   */
  inputs?: Record<string, Partial<FormInputInterface> | false>
}

const namespaces: Record<string, string> = {
  hydra: "http://www.w3.org/ns/hydra/core#",
  rdfs: "http://www.w3.org/2000/01/rdf-schema#",
  owl: "http://www.w3.org/2002/07/owl#",
}

/** A term of `prefix`, whether the document is prefixed, bare or expanded. */
const term = (node: any, name: string, prefix = "hydra"): any =>
  node?.[name] ?? node?.[`${prefix}:${name}`] ?? node?.[namespaces[prefix] + name]

/** The value of a term: an IRI or a literal, unwrapped from `@id`/`@value`. */
const read = (node: any, name: string, prefix = "hydra"): any => {
  const value = term(node, name, prefix)
  const single = Array.isArray(value) && value.length === 1 ? value[0] : value
  if (single && typeof single === "object" && !Array.isArray(single)) {
    return single["@id"] ?? single["@value"] ?? single
  }
  return single
}

/** `#Book`, `Book` and `https://example.com/docs.jsonld#Book` are one class. */
const localName = (iri: string): string =>
  iri.includes("#") ? iri.slice(iri.lastIndexOf("#") + 1) : iri

/** `integer` for `xsd:integer`, `xmls:integer` or its full IRI. */
const datatype = (range: string): string | undefined =>
  /^(?:xsd:|xmls:|http:\/\/www\.w3\.org\/2001\/XMLSchema#)(\w+)$/.exec(range)?.[1]

const datatypeControllers: Record<string, InputControllerComponentInterface> = {
  string: DefaultInputController,
  integer: NumberInputController,
  decimal: NumberInputController,
  float: NumberInputController,
  double: NumberInputController,
  dateTime: DatePickerInputController,
  date: DatePickerInputController,
  boolean: SwitchInputController,
}

const toArray = (value: any): any[] =>
  value === undefined ? [] : Array.isArray(value) ? value : [value]

const findClass = (doc: HydraDocumentation, iri: string) =>
  toArray(term(doc, "supportedClass")).find(
    (supportedClass) =>
      typeof supportedClass["@id"] === "string" &&
      (supportedClass["@id"] === iri ||
        localName(supportedClass["@id"]) === localName(iri))
  )

/**
 * Builds the form of a class from the Hydra documentation of the API: one
 * field per writable or readable property, its controller picked from its
 * range, `required` and `readonly` taken from the documentation.
 *
 * Pure: fetching the documentation is up to the application.
 *
 * @throws when the documentation does not describe `classIri`.
 */
export function createFormFromHydraClass<Data extends object = any>(
  doc: HydraDocumentation,
  classIri: string,
  options: HydraFormOptions = {}
): FormInterface<Data> {
  const supportedClass = findClass(doc, classIri)
  if (!supportedClass) {
    throw new Error(`The Hydra documentation does not describe "${classIri}".`)
  }

  const inputs: Record<string, FormInputInterface> = {}

  for (const supportedProperty of toArray(
    term(supportedClass, "supportedProperty")
  )) {
    const property = term(supportedProperty, "property") ?? {}
    const name: string | undefined =
      read(property, "label", "rdfs") ?? read(supportedProperty, "title")
    if (!name) continue

    const readable = read(supportedProperty, "readable") !== false
    const writeable =
      (read(supportedProperty, "writeable") ??
        read(supportedProperty, "writable")) !== false
    // Neither sent nor shown: nothing to put in a form.
    if (!readable && !writeable) continue

    const input: FormInputInterface = {
      label: read(supportedProperty, "title") ?? name,
      required: read(supportedProperty, "required") === true,
      controller: DefaultInputController,
    }
    const description = read(supportedProperty, "description")
    if (description) input.description = description
    if (!writeable) input.readonly = true

    const ranges = toArray(read(property, "range", "rdfs"))
    const range: string | undefined =
      typeof ranges[0] === "string" ? ranges[0] : undefined
    const type = range ? datatype(range) : undefined
    const isLink = toArray(property["@type"]).some(
      (value: string) => localName(value) === "Link" || value === "hydra:Link"
    )

    if (type) {
      input.controller = datatypeControllers[type] ?? DefaultInputController
    } else if (range && (isLink || findClass(doc, range))) {
      const relation: HydraRelation = {
        name,
        range,
        multiple: Number(read(property, "maxCardinality", "owl")) !== 1,
      }
      input.controller = relation.multiple
        ? MultiSelectSearchInputController
        : SelectSearchInputController
      const { onSearch } = options
      if (onSearch) input.onSearch = (query) => onSearch(query, relation)
    }

    inputs[name] = input
  }

  for (const [name, override] of Object.entries(options.inputs ?? {})) {
    if (override === false) {
      delete inputs[name]
    } else {
      inputs[name] = { ...inputs[name], ...override }
    }
  }

  return {
    name: read(supportedClass, "title") ?? localName(supportedClass["@id"]),
    inputs,
  } as FormInterface<Data>
}
