# react-data-form

## 0.2.1

### Patch Changes

- 125d485: `PasswordInputController` reprend le rendu des autres champs texte : même
  `Input` que `DefaultInputController` (hauteur, rayon, fond, bordure, focus),
  sans cadenas ni placeholder `"..."` par défaut. Le bouton œil est centré sur
  l'input (`z-10`) et ses libellés passent par `translate`. L'id par défaut
  devient `formInput.id ?? formInput.name`, pour que mot de passe et
  confirmation n'aient plus le même id.
- 68225c6: `PasswordInputController` respecte `readonly` (et `required`) comme
  `DefaultInputController`, et son bouton œil a un focus visible. `Input` neutralise
  le fond et la couleur de texte imposés par Chrome sur un champ pré-rempli
  (`:autofill`) : les champs texte (Email, Password…) gardent les couleurs du
  thème, en clair et en sombre.
- fa9f665: Documente que `useForm` ne lit `form` qu'au premier rendu, comme
  `defaultValue` : repasser un autre objet ensuite n'a aucun effet. Pour changer
  de déclaration, appeler `updateForm` (les valeurs saisies sont conservées) ou
  remonter le composant avec une nouvelle `key`. JSDoc de `useForm` et README à
  jour.

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
