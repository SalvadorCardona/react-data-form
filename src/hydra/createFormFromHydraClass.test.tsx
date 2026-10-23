import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { createFormFromHydraClass } from "@/hydra/createFormFromHydraClass"
import FormElement from "@/form/component/form/FormElement"
import useForm from "@/form/hook/useForm"
import { FormInterface } from "@/form/FormInterface"
import { DatePickerInputController } from "@/form/component/InputController/DatePickerInputController"
import { DefaultInputController } from "@/form/component/InputController/DefaultInputController"
import { MultiSelectSearchInputController } from "@/form/component/InputController/MultiSelectSearchInputController"
import { NumberInputController } from "@/form/component/InputController/NumberInputController"
import { SelectSearchInputController } from "@/form/component/InputController/SelectSearchInputController"
import { SwitchInputController } from "@/form/component/InputController/SwitchInputController"
// https://demo.api-platform.com/docs.jsonld (API Platform 4), fetched on
// 2026-10-23: a few classes, without their operations.
import demo from "@/hydra/apiPlatformDemo.fixture.json"

describe("createFormFromHydraClass", () => {
  describe("on the API Platform demo", () => {
    const form = createFormFromHydraClass(demo, "#Review")

    it("declares one field per property, labelled by hydra:title", () => {
      expect(form.name).toBe("Review")
      expect(Object.keys(form.inputs!)).toEqual([
        "user",
        "book",
        "publishedAt",
        "body",
        "rating",
        "letter",
      ])
      expect(form.inputs!.body!.label).toBe("body")
    })

    it("picks the controller from the xsd range", () => {
      expect(form.inputs!.body!.controller).toBe(DefaultInputController)
      expect(form.inputs!.rating!.controller).toBe(NumberInputController)
      expect(form.inputs!.publishedAt!.controller).toBe(DatePickerInputController)
    })

    it("turns a to-one relation into a searchable select", () => {
      expect(form.inputs!.book!.controller).toBe(SelectSearchInputController)
      expect(form.inputs!.user!.controller).toBe(SelectSearchInputController)
    })

    it("turns a to-many relation into a searchable multi-select", () => {
      const book = createFormFromHydraClass(demo, "#Book")
      expect(book.inputs!.reviews!.controller).toBe(MultiSelectSearchInputController)
      expect(book.inputs!.reviews!.description).toBe("An IRI of reviews.")
    })

    it("reads hydra:required and hydra:writeable", () => {
      expect(form.inputs!.body).toMatchObject({ required: true })
      expect(form.inputs!.letter).toMatchObject({ required: false })
      expect(form.inputs!.letter!.readonly).toBeUndefined()
      expect(form.inputs!.publishedAt!.readonly).toBe(true)
      expect(form.inputs!.book!.readonly).toBe(true)
    })

    it("falls back to a text field without a range", () => {
      const book = createFormFromHydraClass(demo, "#Book")
      expect(book.inputs!.condition!.controller).toBe(DefaultInputController)
    })

    it("finds the class by its full IRI", () => {
      const byIri = createFormFromHydraClass(
        demo,
        "https://demo.api-platform.com/docs.jsonld#Bookmark"
      )
      expect(Object.keys(byIri.inputs!)).toEqual(["book", "bookmarkedAt"])
    })

    it("throws for a class the documentation does not describe", () => {
      expect(() => createFormFromHydraClass(demo, "#Unknown")).toThrow(
        /does not describe "#Unknown"/
      )
    })

    it("hands the relation to onSearch", async () => {
      const onSearch = vi.fn(async () => [{ label: "Dune", value: "/books/1" }])
      const withSearch = createFormFromHydraClass(demo, "#Review", { onSearch })

      await expect(withSearch.inputs!.book!.onSearch!("du")).resolves.toEqual([
        { label: "Dune", value: "/books/1" },
      ])
      expect(onSearch).toHaveBeenCalledWith("du", {
        name: "book",
        range: "#AdminBook",
        multiple: false,
      })
      expect(withSearch.inputs!.body!.onSearch).toBeUndefined()
    })

    it("merges the overrides, drops a field set to false and adds new ones", () => {
      const overridden = createFormFromHydraClass(demo, "#Review", {
        inputs: {
          body: { label: "Review", placeholder: "What did you think?" },
          letter: false,
          user: false,
          note: { label: "Note" },
        },
      })

      expect(overridden.inputs!.body).toMatchObject({
        label: "Review",
        placeholder: "What did you think?",
        required: true,
        controller: DefaultInputController,
      })
      expect(overridden.inputs!.letter).toBeUndefined()
      expect(overridden.inputs!.user).toBeUndefined()
      expect(overridden.inputs!.note).toEqual({ label: "Note" })
    })

    it("renders with FormElement", () => {
      const ReviewForm = ({ form }: { form: FormInterface }) => {
        const formContext = useForm({ form })
        return <FormElement {...formContext} />
      }
      render(<ReviewForm form={form} />)

      expect(screen.getByText("body")).toBeInTheDocument()
      expect(screen.getByText("rating")).toBeInTheDocument()
    })
  })

  // API Platform 3 prefixes every term, and older versions type with `xmls:`.
  describe("on a prefixed documentation", () => {
    const doc = {
      "hydra:supportedClass": [
        {
          "@id": "https://schema.org/Event",
          "@type": "hydra:Class",
          "hydra:title": "Event",
          "hydra:supportedProperty": [
            {
              "@type": "hydra:SupportedProperty",
              "hydra:property": {
                "@id": "https://schema.org/name",
                "@type": "rdf:Property",
                "rdfs:label": "name",
                "rdfs:range": "xmls:string",
              },
              "hydra:title": "Name",
              "hydra:required": true,
              "hydra:readable": true,
              "hydra:writeable": true,
            },
            {
              "hydra:property": {
                "@id": "#Event/price",
                "rdfs:label": "price",
                "rdfs:range": "xmls:decimal",
              },
              "hydra:title": "Price",
            },
            {
              "hydra:property": {
                "@id": "#Event/isPublic",
                "rdfs:label": "isPublic",
                "rdfs:range": "xmls:boolean",
              },
              "hydra:title": "Public",
            },
            {
              "hydra:property": {
                "@id": "#Event/startDate",
                "rdfs:label": "startDate",
                "rdfs:range": { "@id": "http://www.w3.org/2001/XMLSchema#dateTime" },
              },
              "hydra:title": "Start",
            },
            {
              "hydra:property": {
                "@id": "#Event/place",
                "@type": "hydra:Link",
                "rdfs:label": "place",
                "rdfs:range": "https://schema.org/Place",
                "owl:maxCardinality": 1,
              },
              "hydra:title": "Place",
            },
            {
              "hydra:property": {
                "@id": "#Event/secret",
                "rdfs:label": "secret",
                "rdfs:range": "xmls:string",
              },
              "hydra:title": "Secret",
              "hydra:readable": false,
              "hydra:writeable": false,
            },
            {
              "hydra:property": {
                "@id": "#Event/password",
                "rdfs:label": "password",
                "rdfs:range": "xmls:string",
              },
              "hydra:title": "Password",
              "hydra:readable": false,
              "hydra:writeable": true,
            },
          ],
        },
      ],
    }
    const form = createFormFromHydraClass(doc, "https://schema.org/Event")

    it("maps the xmls ranges", () => {
      expect(form.inputs!.name).toMatchObject({
        label: "Name",
        required: true,
        controller: DefaultInputController,
      })
      expect(form.inputs!.price!.controller).toBe(NumberInputController)
      expect(form.inputs!.isPublic!.controller).toBe(SwitchInputController)
      expect(form.inputs!.startDate!.controller).toBe(DatePickerInputController)
      expect(form.inputs!.place!.controller).toBe(SelectSearchInputController)
    })

    it("leaves out what is neither readable nor writeable, keeps write-only", () => {
      expect(form.inputs!.secret).toBeUndefined()
      expect(form.inputs!.password!.readonly).toBeUndefined()
    })
  })
})
