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
  "None",
  "Current value",
  "Nothing found.",
  "{{count}} selected",
  "Unable to load the options.",
  "Clear the selection",
  "Remove {{label}}",
  // SliderInputController and ColorInputController
  "Minimum",
  "Maximum",
  "Hexadecimal code",
  // WysiwygInputController
  // Dates
  "Pick a date",
  "Clear the date",
  "Start date",
  "End date",
  "Selected range",
  "{{label}}:",
  "The end date must be after the start date",
  // Images
  "Image unavailable",
  "Remove the image",
  // Rich text editor
  "Insert link",
  "Undo",
  "Redo",
  // TextAreaInputController, DurationInputController and SelectTimeInputController
  "Your message...",
  "Hours",
  "Minutes",
  "Select",
  "15 minutes",
  "30 minutes",
  "45 minutes",
  "1 hour",
  "2 hours",
  "3 hours",
  "4 hours",
  "5 hours",
  "6 hours",
  "7 hours",
  "8 hours",
  "9 hours",
  "10 hours",
  "1 day",
  // IaImageInputController and IconInputController
  "Click or drop an image",
  "The AI will analyze this image to fill in the form",
  "PDF document",
  "Pick an emoji",
  "Change emoji",
  "Remove emoji",
  // Dialogs
  "Close",
  "Command palette",
  "Search for an action to run…",
  // Wysiwyg editor
  "Bold (⌘B)",
  "Italic (⌘I)",
  "Inline code (⌘E)",
  "Paragraph",
  "Insert link (⌘K)",
  "Add a link",
  "Enter the link URL",
  "URL",
  "Add the link",
  "Undo (⌘Z)",
  "Redo (⌘⇧Z)",
  "Start writing something great…",
  // react-data-form/step
  "Previous",
  "Next",
  "Finish",
  "Step {{current}} of {{total}}",
  "Invalid Form",
] as const

export type TranslationKey = (typeof translationKeys)[number]
