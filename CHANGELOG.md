# react-data-form

## 0.3.2

### Patch Changes

- f7bcdbc: fix: the summary under `DateRangeInputController` ("Selected range: …") no longer hard-codes the English "at" between date and time. It uses the long localised formats of the `dateLocale` port (`PPP`, `PPPp`), so a French app reads "2 novembre 2026 à 07:46" instead of "2 novembre 2026 at 07:46". Without a locale, date-fns keeps US English ("November 2nd, 2026 at 7:46 AM").

  The colon after "Selected range" goes through the `"{{label}}:"` translation key, so a French app can set it off with a non-breaking space ("Période sélectionnée : …").

## 0.3.1

### Patch Changes

- d4157b6: fix: the `react-mini-i18n` peer accepts 0.2 (`^0.1.0 || ^0.2.0`), so `pnpm add react-data-form react-mini-i18n resource-registry` installs react-mini-i18n 0.2.0 instead of stopping on `ERESOLVE`

  - In 0.x a caret pins the minor: `^0.1.0` ruled out react-mini-i18n 0.2.0, which only adds `initialTranslations` and a server render. 0.1 stays accepted, so an app still on it is not forced to move.

## 0.3.0

### Minor Changes

- 4600f01: The default theme (`react-data-form/styles.css`) now follows the Hermez design system instead of shadcn's neutral greys. Visible only if you import that stylesheet; an app that declares its own theme variables is unaffected.

  - Colours: warm "stone" greys (background `#fafaf9`, text `#1c1917`, secondary text `#57534e`, border `#e7e5e4`, fields `#d6d3d1`), orange primary `#bf4a02` with white text, focus ring `#e46212`, highlight `#fff6ee`. The `.dark` variant keeps the same hue (background `#0c0a09`, primary `#ff8b44`).
  - Radius: `--radius` goes from `0.875rem` to `0.75rem`, and `--radius-2xl` to `--radius-4xl` are now derived from it, so square-cornered themes no longer get pill-shaped buttons.
  - Fonts: `--font-sans` becomes the system font stack, and new `--typeface-heading` / `font-heading` point to "Bricolage Grotesque Variable" with a system fallback. The library ships no font and no rule on your `h1`–`h6`.
  - New tokens: `--success`, `--info`, `--glory`, `--warning`, `--chart-1` to `--chart-5`, and warm-tinted `shadow-sm` / `shadow-md` / `shadow-lg` (plus `shadow-glow`).

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
