/**
 * Every key the library sends through `react-mini-i18n`.
 *
 * Keys are the English text itself: without a dictionary they read as they
 * are. Hand this list to whatever checks your own dictionary, rather than
 * rebuilding it from the components.
 */
export const translationKeys = [
  // Submit button and form-level labels
  "Create",
  "Save",
  "Saved",
  "The form is invalid",
  "Unable to load the data",
  // Validation
  "This field is required",
  "This value should be greater than or equal to {{min}}",
  "This value should be less than or equal to {{max}}",
  "Invalid value",
  // FormArrayInputController and its palette
  "Add a block",
  "Pick the shape this entry takes.",
  "Drag",
  "Order",
  "Move up",
  "Move down",
  "Collapse the block",
  "Expand the block",
  "Remove",
  "This collection should contain {{min}} elements or more.",
  "This collection should contain {{max}} elements or less.",
  // ArrayInputController
  "Add",
  "Remove {{value}}",
  "Minimum {{min}} characters",
  // Text, password, search and select fields
  "Show password",
  "Hide password",
  "Search...",
  "Clear search",
  "Select...",
  "Nothing found.",
  "{{count}} selected",
  "Unable to load the options.",
  // Dates
  "Pick a date",
  "Start date",
  "End date",
  "Selected range",
  "{{label}}:",
  "The end date must be after the start date",
  // Images
  "Image unavailable",
  // react-data-form/step
  "Previous",
  "Next",
  "Finish",
  "Step {{current}} of {{total}}",
  "Invalid Form",
] as const

export type TranslationKey = (typeof translationKeys)[number]
