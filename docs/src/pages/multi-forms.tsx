import { Heading, Images, Text } from "lucide-react"
import {
  ArrayInputController,
  FormElement,
  type FormInterface,
  WysiwygInputController,
  addForm,
  createFormArrayInputController,
  useForm,
} from "react-data-form"
import { CodeBlock, LiveExample, PageHeader, Section } from "../DocLayout"

/**
 * The three shapes an entry can take, registered once when this module loads.
 * Their `@for` tag is the whole link: it is what an entry stores as its `type`,
 * and what the palette is asked for.
 */
addForm("titleForm", {
  "@for": ["title"],
  name: "Title",
  icon: Heading,
  inputs: {
    order: {},
    data: { label: "Your title", placeholder: "A page made of blocks" },
  },
})

addForm("longTextForm", {
  "@for": ["long-text"],
  name: "Rich text",
  icon: Text,
  inputs: {
    order: {},
    data: { label: "Your text", controller: WysiwygInputController },
  },
})

addForm("galleryForm", {
  "@for": ["gallery"],
  name: "Gallery",
  icon: Images,
  inputs: {
    order: {},
    images: {
      label: "Images",
      controller: ArrayInputController,
      placeholder: "An image URL, then Enter",
    },
  },
})

interface PageDraft {
  blocks: Record<string, unknown>[]
}

/**
 * One array field, three shapes. Add a block from the palette, drag it by its
 * handle or type an order in its header: the data on the right follows.
 */
function AsymmetricFormExample() {
  const form: FormInterface<PageDraft> = {
    label: { title: "Page content" },
    // The data is shown live next to the form, so there is nothing to submit.
    components: { formSubmitAction: () => null },
    inputs: {
      blocks: createFormArrayInputController({
        label: "Blocks",
        draggable: true,
        identifierKey: "order",
        forms: ["title", "long-text", "gallery"],
        defaultValue: () => [
          { id: "1", type: "title", order: 0, data: "A page made of blocks" },
          {
            id: "2",
            type: "long-text",
            order: 1,
            data: "<p>Each entry carries its own <em>type</em>.</p>",
          },
          {
            id: "3",
            type: "gallery",
            order: 2,
            images: ["https://picsum.photos/id/1015/600/400"],
          },
        ],
      }),
    },
  }

  const formContext = useForm<PageDraft>({ form })

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_16rem]">
      <div className="min-w-0">
        <FormElement {...formContext} />
      </div>
      <aside className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Form data
        </p>
        <pre className="mt-2 max-h-[32rem] overflow-auto rounded-md bg-muted p-3 text-xs leading-relaxed">
          <code data-testid="form-data">
            {JSON.stringify(formContext.form.data, null, 2)}
          </code>
        </pre>
      </aside>
    </div>
  )
}

export function MultiFormsPage() {
  return (
    <>
      <PageHeader
        title="Asymmetric forms"
        intro="One array field whose entries do not share a shape: a title, a rich text, a gallery. The kind of thing a page builder needs, described as data like everything else."
      />

      <Section
        title="A page made of blocks"
        intro="Three shapes registered, one field offering them. Add a block, reorder it, watch the data."
      >
        <LiveExample label="Live">
          <AsymmetricFormExample />
        </LiveExample>
      </Section>

      <Section
        title="Registering a shape"
        intro="addForm stores a form in the registry and tags it with the types it renders."
      >
        <CodeBlock>{registering}</CodeBlock>
        <p>
          <code>name</code> and <code>icon</code> are what the palette displays.{" "}
          <code>@for</code> is the tag: a form tagged <code>["title"]</code> renders
          every entry whose <code>type</code> is <code>"title"</code>.
        </p>
        <p>
          The registry is a module-level singleton shared with{" "}
          <code>resource-registry</code>, so registration happens once, at import
          time — not on every render.
        </p>
      </Section>

      <Section
        title="Offering the shapes in the palette"
        intro="createFormArrayInputController builds the field and wires FormArrayInputController as its controller."
      >
        <CodeBlock>{offering}</CodeBlock>
        <p>
          <code>forms</code> lists the tags the palette offers — those three and
          nothing else, even if the registry holds more.
        </p>
      </Section>

      <Section
        title="Finding the shape back"
        intro="Each entry stores the type it was created from, so the array can be rendered without any of it being hardcoded."
      >
        <p>
          Picking <em>Gallery</em> in the palette appends{" "}
          <code>{`{ id, type: "gallery", order }`}</code> to the value. At render,
          each entry is looked up with <code>getForm</code>:
        </p>
        <CodeBlock>{finding}</CodeBlock>
        <p>
          That is the whole asymmetry: the value is a plain array, each element names
          its shape, and the shape lives in the registry rather than in the
          component. Store the array as-is and it renders back the same.
        </p>
      </Section>

      <Section
        title="Options"
        intro="Everything createFormArrayInputController accepts, on top of the usual field keys."
      >
        <ul className="not-prose mt-4 space-y-3 text-muted-foreground">
          <li>
            <code>forms</code> — the <code>@for</code> tags offered in the palette.
            An empty array is not the same as omitting the key: it offers{" "}
            <em>every</em> registered form. Omit it entirely and there is no palette
            at all, just an "Add" button appending a blank entry built from{" "}
            <code>form</code>.
          </li>
          <li>
            <code>draggable</code> — adds a grip handle to each block header and lets
            a block be dropped onto another, which reindexes the whole array.
          </li>
          <li>
            <code>identifierKey</code> — the key holding the position, defaulting to{" "}
            <code>"order"</code>. It is edited from the block header, and hidden from
            the block body when the shape declares it as a field.
          </li>
          <li>
            <code>defaultValue</code> — the entries the field starts with, as a value
            or a function returning one. Used when the form is built without data for
            that field.
          </li>
          <li>
            <code>form</code> — the fallback shape, rendering entries that carry no{" "}
            <code>type</code>, or one no registered form answers to. With a palette
            wired up every entry has a type, so it rarely comes into play.
          </li>
        </ul>
      </Section>
    </>
  )
}

const registering = `import { addForm, WysiwygInputController } from "react-data-form"
import { Heading, Text } from "lucide-react"

addForm("titleForm", {
  "@for": ["title"],
  name: "Title",
  icon: Heading,
  inputs: {
    order: {},
    data: { label: "Your title" },
  },
})

addForm("longTextForm", {
  "@for": ["long-text"],
  name: "Rich text",
  icon: Text,
  inputs: {
    order: {},
    data: { label: "Your text", controller: WysiwygInputController },
  },
})`

const offering = `import { createFormArrayInputController } from "react-data-form"

const form: FormInterface = {
  inputs: {
    blocks: createFormArrayInputController({
      label: "Blocks",
      draggable: true,
      identifierKey: "order",
      forms: ["title", "long-text", "gallery"],
    }),
  },
}`

const finding = `// The value the field holds
[
  { id: "1", type: "title", order: 0, data: "A page made of blocks" },
  { id: "3", type: "gallery", order: 2, images: [/* … */] },
]

// What the controller does with each entry
const shape = getForm({ type: entry.type })`
