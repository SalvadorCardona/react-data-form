# react-data-form

## 0.2.0

### Minor Changes

- 7a59564: `react-data-form/media` now ships the media controllers, behind a port.

  - `MediaObjectInputController` (upload, drag & drop, image editing, document
    preview) and `MediaObjectGalleryInputController`, along with their factories
    `mediaObjectInputControllerFactory`,
    `mediaObjectGalleryInputControllerFactory`, the `createMediaObjectInput` /
    `createMediaObjectWithPdfInput` / `createMediaObjectDocumentInput` inputs and
    the `IMAGE_ACCEPTED_TYPES`, `PDF_ACCEPTED_TYPE`, `DOCUMENT_ACCEPTED_TYPES`
    accepted types.
  - The API behind the upload stays in the application: it implements
    `MediaObjectPortInterface` and injects it through `<MediaObjectProvider>`,
    which the controllers read with `useMediaObjectPort()`. Errors are reported
    through the port's `onError`, so the library carries no notification system
    of its own.
  - Displayed strings default to English and are overridden label by label
    through the provider's `labels`.
  - `createInMemoryMediaObjectPort()` implements the port in memory, for tests,
    stories and documentation pages.
