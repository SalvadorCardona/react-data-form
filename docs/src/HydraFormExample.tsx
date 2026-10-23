import { useState } from "react"
import { FormElement, useForm } from "react-data-form"
import { createFormFromHydraClass } from "react-data-form/hydra"

/**
 * An excerpt of https://demo.api-platform.com/docs.jsonld, the `Review` class
 * as API Platform 4 documents it: an application fetches the whole document.
 */
const docs = {
  supportedClass: [
    {
      "@id": "#Review",
      "@type": "Class",
      title: "Review",
      supportedProperty: [
        {
          property: {
            "@id": "#Review/book",
            "@type": "Link",
            label: "book",
            "owl:maxCardinality": 1,
            range: "#Book",
          },
          title: "book",
          required: true,
          readable: true,
          writeable: true,
        },
        {
          property: { "@id": "#Review/body", label: "body", range: "xsd:string" },
          title: "body",
          required: true,
          readable: true,
          writeable: true,
        },
        {
          property: {
            "@id": "#Review/rating",
            label: "rating",
            range: "xsd:integer",
          },
          title: "rating",
          required: true,
          readable: true,
          writeable: true,
        },
        {
          property: {
            "@id": "#Review/publishedAt",
            label: "publishedAt",
            range: "xsd:dateTime",
          },
          title: "publishedAt",
          required: false,
          readable: true,
          writeable: false,
        },
      ],
    },
    { "@id": "#Book", "@type": "Class", title: "Book" },
  ],
}

const books = [
  { label: "Dune", value: "/books/1" },
  { label: "Foundation", value: "/books/2" },
  { label: "Hyperion", value: "/books/3" },
]

const form = {
  ...createFormFromHydraClass(docs, "#Review", {
    // Where the application would call GET /books?title=…
    onSearch: async (query) =>
      books.filter((book) => book.label.toLowerCase().includes(query.toLowerCase())),
    inputs: {
      body: { label: "Review" },
      rating: { label: "Rating", min: 0, max: 5 },
      publishedAt: { label: "Published at" },
      book: { label: "Book" },
    },
  }),
  label: { submit: "Save" },
}

/** A review form generated from the Hydra documentation, labels overridden. */
export function HydraFormExample() {
  const [submitted, setSubmitted] = useState<object | null>(null)
  const formContext = useForm({
    form: { ...form, onSubmit: (data) => (setSubmitted(data), data) },
  })

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_14rem]">
      <div className="min-w-0">
        <FormElement {...formContext} />
      </div>
      <aside className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Submitted
        </p>
        <pre className="mt-2 max-h-52 overflow-auto rounded-md bg-muted p-3 text-xs">
          <code>
            {submitted ? JSON.stringify(submitted, null, 2) : "Nothing yet."}
          </code>
        </pre>
      </aside>
    </div>
  )
}
