![react-data-form](https://raw.githubusercontent.com/SalvadorCardona/brand-assets/main/projects/react-data-form/banner.png)

# react-data-form

[Documentation & live demos](https://cardona.digital/react-data-form/)

Data-driven React forms: you describe a form as an object, the library renders
the fields, holds the state, validates, and reports the errors your API sends
back.

Built for JSON-LD / [API Platform](https://api-platform.com) backends, but
usable with any of them.

```tsx
import { DatePickerInputController, FormElement, useForm } from "react-data-form"

const formContext = useForm({
  form: {
    label: { title: "My profile" },
    inputs: {
      firstName: { label: "First name" },
      email: { type: "email", label: "Email" },
      birthDate: { label: "Born on", controller: DatePickerInputController },
    },
    onSubmit: (data) => api.patch("/me", data),
  },
})

return <FormElement {...formContext} />
```

## Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Entry points](#entry-points)
- [Concepts](#concepts)
- [Available field controllers](#available-field-controllers)
- [Development](#development)
- [Author](#author)

## Installation

```bash
pnpm add react-data-form react-mini-i18n resource-registry
```

`react` and `react-dom` (18.3+ or 19),
[`react-mini-i18n`](https://github.com/SalvadorCardona/react-mini-i18n) and
[`resource-registry`](https://github.com/SalvadorCardona/resource-registry) are
peer dependencies — your copies are the ones used.

Those two are peer dependencies rather than plain dependencies because each owns
a module-level singleton: a translation dictionary on one side, a resource
registry on the other. Two copies in `node_modules` would mean two dictionaries
and two registries, so half your translations would appear ignored and forms
registered on one side would be invisible from the other.

### Styles

The components are written with [Tailwind CSS v4](https://tailwindcss.com)
classes backed by the shadcn theme variables. Tailwind must scan the library's
compiled files to generate those classes:

```css
@import "tailwindcss";
@source "../node_modules/react-data-form/dist";
```

If your application has no shadcn theme yet, import the neutral one shipped
here — otherwise **do not** import it, and the library will pick up your own
palette:

```css
@import "react-data-form/styles.css";
```

## Configuration

The library assumes no backend, no router and no visual identity. Those touch
points go through ports injected once at startup. All of them have defaults, so
the library works with no configuration at all.

```tsx
import { configurePorts } from "react-data-form"
import { fr } from "date-fns/locale"

configurePorts({
  // Locale used by the date fields. Defaults to US English.
  dateLocale: fr,
  // BCP 47 tag used by Intl for dates and amounts, and the currency for prices.
  intlLocale: "fr-FR",
  currency: "EUR",

  components: {
    // Renders the readable label of an IRI in dropdowns.
    // By default the raw identifier is shown.
    iriLabel: ({ iri }) => <ResourceName iri={iri} />,
    // Brand mark shown at the centre of the loader. Defaults to nothing.
    logo: MyLogo,
  },
})
```

Form-wide behaviour is set separately, through `setFormConfig`:

```ts
import { setFormConfig } from "react-data-form"

setFormConfig({
  defaultForm: {
    label: { success: "Saved", error: "The form is invalid" },
  },
})
```

### Translation

Labels go through
[`react-mini-i18n`](https://github.com/SalvadorCardona/react-mini-i18n), so your
application and the forms share one dictionary:

```ts
import { setTranslation } from "react-mini-i18n"

setTranslation({ "My profile": "Mon profil" })
```

## Entry points

| Import                  | Contents                                                         |
| ----------------------- | ---------------------------------------------------------------- |
| `react-data-form`       | Core: `useForm`, `FormElement`, field controllers, configuration |
| `react-data-form/group` | Splitting fields into collapsible sections                       |
| `react-data-form/media` | Media fields: upload, gallery, image editor                      |
| `react-data-form/step`  | Multi-step forms with navigation                                 |

## Concepts

### A form is data

A form is a `FormInterface` object describing its fields, labels, action and
behaviour. Nothing is hardcoded in JSX, so the same description can be stored,
transformed, or generated from an API schema.

```ts
const form: FormInterface = {
  action: ActionList.create,
  inputs: {
    name: { label: "Name", required: true },
    price: { label: "Price", controller: PriceInputController },
  },
}
```

### Fields delegate rendering to a controller

Every field is rendered by a _controller_: a React component receiving
`{ formInput, onChange }` and needing to know nothing else about the form.

Without a `controller`, a field falls back to `DefaultInputController`, an HTML
`<input>` driven by the field's `type` (`text`, `email`, `number`,
`password`…). For anything else, name the controller explicitly:

```ts
inputs: {
  description: { controller: WysiwygInputController },
}
```

A field carrying a `form` key is rendered as a nested sub-form.

Writing your own controller means writing a component that satisfies
`InputControllerInterface` — no registration step involved:

```tsx
const ColorInputController = ({ formInput, onChange }: InputControllerInterface) => (
  <input
    type="color"
    value={formInput.value ?? "#000000"}
    onChange={(e) => onChange({ ...formInput, value: e.target.value })}
  />
)
```

### The form registry

`addForm` registers a form under an IRI and `getForm` finds it back by type,
both exported from the main entry point:

```ts
import { addForm, getForm } from "react-data-form"
import { createResource } from "resource-registry"
```

Both write into the **same** registry. If your application also declares
resources, import `createResource` from `resource-registry` rather than keeping
a copy of it: two registries in memory would keep `searchMetaData` from
connecting a resource to its form.

That registry is what makes [asymmetric arrays](#asymmetric-arrays) possible: a
field can render entries whose shapes it does not know at build time, as long as
each entry names the form it was created from.

### Asymmetric arrays

An array field whose entries do not share a shape — a title, a rich text, a
gallery — is what a page builder needs. Three steps.

**Register each shape.** `@for` is the tag: it is what an entry stores as its
`type`, and what the palette is asked for. `name` and `icon` are what the
palette displays.

```tsx
import { addForm, WysiwygInputController } from "react-data-form"
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
})
```

**Offer them in a field.** `createFormArrayInputController` builds the field and
wires `FormArrayInputController` as its controller. `forms` names the tags the
insertion palette offers — those, and nothing else, even if the registry holds
more.

```ts
import { createFormArrayInputController } from "react-data-form"

const form: FormInterface = {
  inputs: {
    blocks: createFormArrayInputController({
      label: "Blocks",
      draggable: true,
      identifierKey: "order",
      forms: ["title", "long-text", "gallery"],
    }),
  },
}
```

**Let each entry find its shape back.** Picking _Gallery_ in the palette appends
`{ id, type: "gallery", order }` to the value. At render, every entry is looked
up with `getForm({ type })`, so nothing about the shapes is hardcoded in the
field: store the array as-is and it renders back the same.

Options accepted by `createFormArrayInputController`, on top of the usual field
keys:

| Option            | Effect                                                                                                                                                                                                                                            |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `forms`           | The `@for` tags offered in the palette. An empty array is **not** the same as omitting the key: it offers _every_ registered form. Omitted entirely, there is no palette at all — just an "Add" button appending a blank entry built from `form`. |
| `draggable`       | Adds a grip handle to each block header and lets a block be dropped onto another, which reindexes the whole array.                                                                                                                                |
| `closedByDefault` | Mounts every block folded. A block header always carries a chevron folding its body away — handle and order stay, so a long page stays reorderable — and folding is display state only, never part of the value. A block just added opens.        |
| `identifierKey`   | The key holding the position, defaulting to `"order"`. It is edited from the block header, and hidden from the block body when the shape declares it as a field.                                                                                  |
| `defaultValue`    | The entries the field starts with, as a value or a function returning one.                                                                                                                                                                        |
| `form`            | The fallback shape, rendering entries that carry no `type`, or one no registered form answers to. With a palette wired up every entry has a type, so it rarely comes into play.                                                                   |

A live, manipulable example sits on the
[Asymmetric forms](https://cardona.digital/react-data-form/?page=multi-forms)
page of the documentation site.

## Available field controllers

All exported from `react-data-form`, to be passed as a field's `controller`.

**Text** — `DefaultInputController`, `TextAreaInputController`,
`PasswordInputController`, `EmailInputController`, `WebsiteInputController`,
`PhoneInputController`, `WysiwygInputController`, `SearchInputController`,
`AutocompleteInputController`.

**Numbers** — `NumberInputController`, `PriceInputController`,
`DurationInputController`.

**Dates** — `DateInputController`, `DatePickerInputController`,
`DateRangeInputController`, `TimeInputController`, `SelectTimeInputController`,
`MomentInputController`.

**Choices** — `SelectInputController`, `SelectSearchInputController`,
`MultiSelectInputController`, `MultiSelectSearchInputController`,
`SelectRadioInputController`, `SelectCardInputController`,
`SelectButtonInputController`, `CheckboxInputController`,
`SwitchInputController`, `BooleanInputController`, `IconInputController`.

**Composite** — `ArrayInputController`, `FormArrayInputController`
(page builder), `FormInputController` (sub-form), `BlockOrderInput`,
`FileInputController`, `IaImageInputController`.

**Media** — `react-data-form/media` ships `MediaObjectInputController`
(upload, drag & drop, document preview), `MediaObjectGalleryInputController`
and `ImageEditor`, a crop-and-rotate editor.

### Media go through a port

The media controllers know how to render an upload; they know nothing about the
API behind it. Everything they need is described by `MediaObjectPortInterface`,
which the application implements and injects — so no route, no payload and no
authentication ever reaches the library.

```tsx
import {
  MediaObjectProvider,
  MediaObjectPortInterface,
} from "react-data-form/media"

const mediaObjectPort: MediaObjectPortInterface = {
  upload: async ({ base64, role, gallery }) => {
    const media = await api.post("/api/media_objects", {
      fileInBase64: base64,
      role,
      gallery,
    })
    return media["@id"]
  },
  replace: async ({ iri, base64 }) => { /* … */ },
  remove: async (iri) => { /* … */ },
  describe: async (iri) => ({ mimeType: "image/png", label: "photo.png" }),
  toUrl: (iri, options) => (iri ? `/files/${iri}${options?.download ? "?download=1" : ""}` : undefined),
  gallery: {
    create: async ({ role }) => ({ iri: "…", items: [] }),
    read: async (iri) => ({ iri, items: [] }),
  },
  // The library ships no toast of its own: plug yours here.
  onError: (message) => toast.error(message),
}

<MediaObjectProvider port={mediaObjectPort} labels={{ edit: "Modifier" }}>
  <App />
</MediaObjectProvider>
```

`useMediaObjectPort()` gives access to the port and throws an explicit error
outside of the provider. Labels default to English and are overridden one by one
on the provider. For a test, a story or a demo,
`createInMemoryMediaObjectPort()` implements the whole port in memory, with no
server behind it.

## Development

```bash
pnpm install
pnpm test          # 174 tests (Vitest + Testing Library)
pnpm typecheck
pnpm lint
pnpm build         # tsdown → dist/ (ESM + types)
```

### Releasing

Versioning goes through [changesets](https://github.com/changesets/changesets):

```bash
pnpm changeset       # describe the change and its impact (patch / minor / major)
git commit && git push
```

CI publishes to npm once merged to `main`.

## Author

Written by Salvador Cardona — [cardona.digital](https://cardona.digital).

## License

MIT
