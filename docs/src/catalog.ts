import {
  ArrayInputController,
  AutocompleteInputController,
  BooleanInputController,
  CheckboxInputController,
  DateInputController,
  DatePickerInputController,
  DateRangeInputController,
  DurationInputController,
  EmailInputController,
  FileInputController,
  FormArrayInputController,
  type FormInputInterface,
  IaImageInputController,
  IconInputController,
  MomentInputController,
  MultiSelectInputController,
  MultiSelectSearchInputController,
  NumberInputController,
  PasswordInputController,
  PhoneInputController,
  PriceInputController,
  SearchInputController,
  SelectButtonInputController,
  SelectCardInputController,
  SelectInputController,
  SelectRadioInputController,
  SelectSearchInputController,
  SelectTimeInputController,
  SwitchInputController,
  TextAreaInputController,
  TimeInputController,
  WebsiteInputController,
  WysiwygInputController,
} from "react-data-form"
import {
  MediaObjectDocumentGalleryInputController,
  MediaObjectDocumentInputController,
  MediaObjectGalleryInputController,
  MediaObjectInputController,
  MediaObjectWithPdfInputController,
  createInMemoryMediaObjectPort,
} from "react-data-form/media"

export interface DemoInterface {
  /** Name of the exported controller, used as its anchor on the page. */
  name: string
  /** One line on what the field is for. */
  summary: string
  /** The field definition handed to the form — also shown as the snippet. */
  input: FormInputInterface
  /** A value showing the field filled in; without one, no "Filled" state. */
  filled?: unknown
  /** `false` when the controller ignores `readonly`: no read-only state then. */
  readonly?: false
  /** The entry point to import the controller from, when not the main one. */
  from?: "react-data-form/media"
}

export interface DemoGroupInterface {
  id: string
  title: string
  description: string
  demos: DemoInterface[]
}

const sizes = [
  { label: "Small", value: "S" },
  { label: "Medium", value: "M" },
  { label: "Large", value: "L" },
]

const countries = [
  { label: "France", value: "FR" },
  { label: "Belgium", value: "BE" },
  { label: "Switzerland", value: "CH" },
  { label: "Canada", value: "CA" },
  { label: "Senegal", value: "SN" },
  { label: "Japan", value: "JP" },
]

const sampleImage = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 3"><rect width="4" height="3" fill="#94a3b8"/><circle cx="1.2" cy="1" r=".5" fill="#f8fafc"/></svg>'
)}`

/**
 * The media controllers reach an API through a port; this one keeps everything
 * in memory, seeded with one image and one gallery so the filled states have
 * something to show.
 */
export const mediaPort = createInMemoryMediaObjectPort()
mediaPort.medias.set("/media_objects/sample", {
  iri: "/media_objects/sample",
  base64: sampleImage,
  mimeType: "image/svg+xml",
  label: "sample.svg",
})
mediaPort.galleries.set("/media_objects/galleries/sample", {
  iri: "/media_objects/galleries/sample",
  items: ["/media_objects/sample"],
})

const address = {
  street: { label: "Street" },
  city: { label: "City" },
}

/** Stands in for a remote lookup, so search fields can be tried offline. */
const searchCountries = async (query: string) => {
  await new Promise((resolve) => setTimeout(resolve, 250))
  const needle = query.trim().toLowerCase()
  if (!needle) return countries
  return countries.filter((country) => country.label.toLowerCase().includes(needle))
}

export const catalog: DemoGroupInterface[] = [
  {
    id: "text",
    title: "Text",
    description:
      "Without a controller, a field falls back to DefaultInputController — an HTML input driven by its type.",
    demos: [
      {
        name: "DefaultInputController",
        summary: "Plain input; the field's type drives the behaviour.",
        input: { label: "First name", placeholder: "Ada" },
        filled: "Ada",
      },
      {
        name: "TextAreaInputController",
        summary: "Multi-line text.",
        input: {
          label: "Biography",
          controller: TextAreaInputController,
          placeholder: "A few lines…",
        },
        filled:
          "Mathematician, and the first to publish an algorithm meant for a machine.",
      },
      {
        name: "EmailInputController",
        summary: "Email address, with the matching keyboard on mobile.",
        input: { label: "Email", controller: EmailInputController },
        filled: "ada@example.com",
      },
      {
        name: "PasswordInputController",
        summary: "Masked entry with a reveal toggle.",
        input: { label: "Password", controller: PasswordInputController },
        filled: "correct horse battery staple",
      },
      {
        name: "WebsiteInputController",
        summary: "URL, normalised as you type.",
        input: { label: "Website", controller: WebsiteInputController },
        filled: "https://example.com",
      },
      {
        name: "PhoneInputController",
        summary: "Phone number with country prefix.",
        input: { label: "Phone", controller: PhoneInputController },
        filled: "+33 6 12 34 56 78",
      },
      {
        name: "SearchInputController",
        summary:
          "Search box with a clear button; the value is debounced before it reaches the form.",
        input: { label: "Search", controller: SearchInputController },
        filled: "react",
      },
      {
        name: "AutocompleteInputController",
        summary: "Free text with suggestions.",
        input: {
          label: "City",
          controller: AutocompleteInputController,
          valueOptions: [
            { label: "Paris", value: "paris" },
            { label: "Lyon", value: "lyon" },
            { label: "Marseille", value: "marseille" },
          ],
        },
        filled: "lyon",
        readonly: false,
      },
      {
        name: "WysiwygInputController",
        summary:
          "Rich text: headings, lists, links and images. Loaded lazily, so it costs nothing until used.",
        input: { label: "Article", controller: WysiwygInputController },
        filled: "<h2>Hello</h2><p>Some <strong>rich</strong> text.</p>",
      },
    ],
  },
  {
    id: "numbers",
    title: "Numbers",
    description:
      "Amounts and durations are stored in their smallest unit — cents, seconds — and rendered in a readable one.",
    demos: [
      {
        name: "NumberInputController",
        summary: "Number, clamped by min and max.",
        input: {
          label: "Quantity",
          controller: NumberInputController,
          min: 0,
          max: 10,
          value: 3,
        },
        filled: 7,
      },
      {
        name: "PriceInputController",
        summary:
          "Amount typed in the main unit, stored in cents. The currency and formatting come from configurePorts.",
        input: { label: "Price", controller: PriceInputController, value: 1250 },
        filled: 1250,
      },
      {
        name: "DurationInputController",
        summary: "Hours and minutes in, seconds out.",
        input: {
          label: "Duration",
          controller: DurationInputController,
          value: 5400,
        },
        filled: 5400,
      },
    ],
  },
  {
    id: "dates",
    title: "Dates and times",
    description:
      "Every date field formats through the locale given to configurePorts, defaulting to US English.",
    demos: [
      {
        name: "DateInputController",
        summary: "Native date input.",
        input: { label: "Date", controller: DateInputController },
        filled: "2026-10-06T14:30:00.000Z",
      },
      {
        name: "DatePickerInputController",
        summary: "Calendar in a popover.",
        input: { label: "Start date", controller: DatePickerInputController },
        filled: "2026-10-06T14:30:00.000Z",
      },
      {
        name: "DateRangeInputController",
        summary:
          "A range with times. Moving the start shifts the end to preserve the duration.",
        input: { label: "Period", controller: DateRangeInputController },
        readonly: false,
      },
      {
        name: "MomentInputController",
        summary:
          "Date and time in one value; the time can be typed partially without the field fighting back.",
        input: { label: "Appointment", controller: MomentInputController },
        filled: "2026-10-06T14:30:00.000Z",
      },
      {
        name: "TimeInputController",
        summary: "Time of day.",
        input: { label: "Opens at", controller: TimeInputController },
        filled: "2026-10-06T14:30:00.000Z",
      },
      {
        name: "SelectTimeInputController",
        summary: "Time picked from fixed slots.",
        input: { label: "Slot", controller: SelectTimeInputController },
        filled: 3600,
      },
    ],
  },
  {
    id: "choices",
    title: "Choices",
    description:
      "Options come from a static valueOptions list, or from an onSearch function when the list lives on the server.",
    demos: [
      {
        name: "SelectInputController",
        summary: "Dropdown, single choice.",
        input: {
          label: "Size",
          controller: SelectInputController,
          valueOptions: sizes,
        },
        filled: "M",
      },
      {
        name: "SelectSearchInputController",
        summary: "Dropdown with a search field, backed by onSearch.",
        input: {
          label: "Country",
          controller: SelectSearchInputController,
          valueOptions: countries,
          onSearch: searchCountries,
        },
        filled: "FR",
      },
      {
        name: "SelectRadioInputController",
        summary: "Radio buttons, for short lists.",
        input: {
          label: "Shipping",
          controller: SelectRadioInputController,
          valueOptions: [
            { label: "Standard", value: "standard" },
            { label: "Express", value: "express" },
          ],
        },
        filled: "express",
      },
      {
        name: "SelectButtonInputController",
        summary: "Segmented buttons.",
        input: {
          label: "Size",
          controller: SelectButtonInputController,
          valueOptions: sizes,
          value: "M",
        },
        filled: "L",
      },
      {
        name: "SelectCardInputController",
        summary: "Full-width cards with a title and a description.",
        input: {
          label: "Plan",
          controller: SelectCardInputController,
          valueOptions: [
            { label: "Free", value: "free", description: "Up to 3 projects" },
            { label: "Pro", value: "pro", description: "Unlimited projects" },
          ],
        },
        filled: "pro",
      },
      {
        name: "MultiSelectInputController",
        summary: "Several values from a list.",
        input: {
          label: "Tags",
          controller: MultiSelectInputController,
          valueOptions: [
            { label: "React", value: "react" },
            { label: "TypeScript", value: "ts" },
            { label: "Tailwind", value: "tw" },
          ],
        },
        filled: ["react", "ts"],
      },
      {
        name: "MultiSelectSearchInputController",
        summary: "Multiple choice with a search field.",
        input: {
          label: "Countries",
          controller: MultiSelectSearchInputController,
          valueOptions: countries,
          onSearch: searchCountries,
        },
        filled: ["FR", "JP"],
        readonly: false,
      },
      {
        name: "CheckboxInputController",
        summary: "A single checkbox.",
        input: { label: "I accept the terms", controller: CheckboxInputController },
        filled: true,
        readonly: false,
      },
      {
        name: "SwitchInputController",
        summary: "A toggle, for settings applied immediately.",
        input: { label: "Notifications", controller: SwitchInputController },
        filled: true,
        readonly: false,
      },
      {
        name: "BooleanInputController",
        summary: "Yes / no as two buttons.",
        input: { label: "Subscribed", controller: BooleanInputController },
        filled: true,
        readonly: false,
      },
      {
        name: "IconInputController",
        summary: "Emoji picker; the grid loads only when opened.",
        input: { label: "Icon", controller: IconInputController },
        filled: "🦊",
        readonly: false,
      },
    ],
  },
  {
    id: "composite",
    title: "Composite",
    description:
      "Fields holding several values, or whole sub-forms repeated as blocks.",
    demos: [
      {
        name: "ArrayInputController",
        summary: "A list of values, added and removed inline.",
        input: { label: "Keywords", controller: ArrayInputController },
        filled: ["forms", "react"],
        readonly: false,
      },
      {
        name: "FormInputController",
        summary:
          "A sub-form held in one field. Picked automatically when the field has a form.",
        input: { label: "Address", form: { inputs: address } },
        filled: { street: "12 Analytical Row", city: "London" },
        readonly: false,
      },
      {
        name: "FormArrayInputController",
        summary:
          "The same sub-form repeated as blocks that can be added, reordered and folded.",
        input: {
          label: "Addresses",
          controller: FormArrayInputController,
          form: { inputs: address },
        },
        filled: [{ order: 0, street: "12 Analytical Row", city: "London" }],
        readonly: false,
      },
    ],
  },
  {
    id: "files",
    title: "Files and media",
    description:
      "The media controllers come from react-data-form/media and upload through the port given to MediaObjectProvider; this page uses the in-memory one.",
    demos: [
      {
        name: "FileInputController",
        summary: "A native file input; the value is the file as a base64 data URL.",
        input: { label: "Attachment", controller: FileInputController },
        readonly: false,
      },
      {
        name: "IaImageInputController",
        summary:
          "Image or PDF dropped or captured, kept as a data URL without any upload — for AI analysis.",
        input: { label: "Receipt", controller: IaImageInputController },
        filled: sampleImage,
      },
      {
        name: "MediaObjectInputController",
        summary: "An image uploaded through the port; the value is its IRI.",
        input: { label: "Avatar", controller: MediaObjectInputController },
        filled: "/media_objects/sample",
        from: "react-data-form/media",
      },
      {
        name: "MediaObjectWithPdfInputController",
        summary: "Same, accepting PDF files as well as images.",
        input: { label: "Scan", controller: MediaObjectWithPdfInputController },
        filled: "/media_objects/sample",
        from: "react-data-form/media",
      },
      {
        name: "MediaObjectDocumentInputController",
        summary: "Same, accepting office documents too.",
        input: {
          label: "Contract",
          controller: MediaObjectDocumentInputController,
        },
        filled: "/media_objects/sample",
        from: "react-data-form/media",
      },
      {
        name: "MediaObjectGalleryInputController",
        summary: "A gallery of images; the value is the gallery's IRI.",
        input: { label: "Photos", controller: MediaObjectGalleryInputController },
        filled: "/media_objects/galleries/sample",
        readonly: false,
        from: "react-data-form/media",
      },
      {
        name: "MediaObjectDocumentGalleryInputController",
        summary: "A gallery of documents.",
        input: {
          label: "Documents",
          controller: MediaObjectDocumentGalleryInputController,
        },
        filled: "/media_objects/galleries/sample",
        readonly: false,
        from: "react-data-form/media",
      },
    ],
  },
]

export const allDemos = catalog.flatMap((group) => group.demos)
