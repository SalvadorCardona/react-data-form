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
  type FormInputInterface,
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

export interface DemoInterface {
  /** Name of the exported controller, used as its anchor on the page. */
  name: string
  /** One line on what the field is for. */
  summary: string
  /** The field definition handed to the form — also shown as the snippet. */
  input: FormInputInterface
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

/** Stands in for a remote lookup, so search fields can be tried offline. */
const searchCountries = async (query: string) => {
  await new Promise((resolve) => setTimeout(resolve, 250))
  const needle = query.trim().toLowerCase()
  if (!needle) return countries
  return countries.filter((country) =>
    country.label.toLowerCase().includes(needle)
  )
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
      },
      {
        name: "TextAreaInputController",
        summary: "Multi-line text.",
        input: {
          label: "Biography",
          controller: TextAreaInputController,
          placeholder: "A few lines…",
        },
      },
      {
        name: "EmailInputController",
        summary: "Email address, with the matching keyboard on mobile.",
        input: { label: "Email", controller: EmailInputController },
      },
      {
        name: "PasswordInputController",
        summary: "Masked entry with a reveal toggle.",
        input: { label: "Password", controller: PasswordInputController },
      },
      {
        name: "WebsiteInputController",
        summary: "URL, normalised as you type.",
        input: { label: "Website", controller: WebsiteInputController },
      },
      {
        name: "PhoneInputController",
        summary: "Phone number with country prefix.",
        input: { label: "Phone", controller: PhoneInputController },
      },
      {
        name: "SearchInputController",
        summary:
          "Search box with a clear button; the value is debounced before it reaches the form.",
        input: { label: "Search", controller: SearchInputController },
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
      },
      {
        name: "WysiwygInputController",
        summary:
          "Rich text: headings, lists, links and images. Loaded lazily, so it costs nothing until used.",
        input: { label: "Article", controller: WysiwygInputController },
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
      },
      {
        name: "PriceInputController",
        summary:
          "Amount typed in the main unit, stored in cents. The currency and formatting come from configurePorts.",
        input: { label: "Price", controller: PriceInputController, value: 1250 },
      },
      {
        name: "DurationInputController",
        summary: "Hours and minutes in, seconds out.",
        input: {
          label: "Duration",
          controller: DurationInputController,
          value: 5400,
        },
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
      },
      {
        name: "DatePickerInputController",
        summary: "Calendar in a popover.",
        input: { label: "Start date", controller: DatePickerInputController },
      },
      {
        name: "DateRangeInputController",
        summary:
          "A range with times. Moving the start shifts the end to preserve the duration.",
        input: { label: "Period", controller: DateRangeInputController },
      },
      {
        name: "MomentInputController",
        summary:
          "Date and time in one value; the time can be typed partially without the field fighting back.",
        input: { label: "Appointment", controller: MomentInputController },
      },
      {
        name: "TimeInputController",
        summary: "Time of day.",
        input: { label: "Opens at", controller: TimeInputController },
      },
      {
        name: "SelectTimeInputController",
        summary: "Time picked from fixed slots.",
        input: { label: "Slot", controller: SelectTimeInputController },
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
      },
      {
        name: "CheckboxInputController",
        summary: "A single checkbox.",
        input: { label: "I accept the terms", controller: CheckboxInputController },
      },
      {
        name: "SwitchInputController",
        summary: "A toggle, for settings applied immediately.",
        input: { label: "Notifications", controller: SwitchInputController },
      },
      {
        name: "BooleanInputController",
        summary: "Yes / no as two buttons.",
        input: { label: "Subscribed", controller: BooleanInputController },
      },
      {
        name: "IconInputController",
        summary: "Emoji picker; the grid loads only when opened.",
        input: { label: "Icon", controller: IconInputController },
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
      },
    ],
  },
]

export const allDemos = catalog.flatMap((group) => group.demos)
