# react-data-form

## 0.2.0

### Minor Changes

- 1377903: Les blocs d'un `FormArrayInputController` se replient.

  - Chaque en-tête de bloc porte un chevron qui masque son sous-formulaire :
    la poignée de drag, l'ordre et le libellé restent, donc une page longue se
    réordonne sans dérouler son contenu. Le bouton porte `aria-expanded` et un
    `aria-label` traduit par les clés `collapse` / `expand`.
  - Replier est un état d'affichage : il ne passe jamais par `onChange` et ne
    rentre pas dans la valeur du formulaire.
  - Nouvelle option `closedByDefault` sur
    `createFormArrayInputController({ closedByDefault: true })` : la liste monte
    entièrement repliée, les blocs ajoutés ensuite aussi — sauf celui qu'on vient
    d'insérer, qui s'ouvre.

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
