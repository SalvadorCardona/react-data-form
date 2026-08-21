# react-data-form

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

| Import | Contents |
| --- | --- |
| `react-data-form` | Core: `useForm`, `FormElement`, field controllers, configuration |
| `react-data-form/group` | Splitting fields into collapsible sections |
| `react-data-form/media` | Image editor: cropping and rotation |
| `react-data-form/step` | Multi-step forms with navigation |

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

Every field is rendered by a *controller*: a React component receiving
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

For media fields, `react-data-form/media` ships `ImageEditor`, a crop-and-rotate
editor independent of any backend, to plug into the upload controller your own
API requires.

## Development

```bash
pnpm install
pnpm test          # 168 tests (Vitest + Testing Library)
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

## License

MIT
