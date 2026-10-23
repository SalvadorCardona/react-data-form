---
"react-data-form": minor
---

i18n : tous les libellés visibles ou lus par un lecteur d'écran passent par `translate` (ou `Trans`), avec une clé anglaise lisible telle quelle. Un test vérifie qu'aucune chaîne française ne reste dans `src/` hors commentaires (le module media, qui a son propre chantier, est exclu).

Les clés françaises de `PasswordInputController`, `SearchInputController` et `DateRangeInputController` sont déjà renommées en anglais (`Show password`, `Hide password`, `Clear search`, `End date`) : voir le changeset `i18n-default-english-fr`.

Libellés en dur désormais traduisibles (nouvelles clés) :

- `TextAreaInputController` : placeholder par défaut `Your message...` (au lieu de « Votre message... » en dur) ; un `placeholder` fourni passe aussi par `translate`.
- `SelectTimeInputController` : `15 minutes`, `30 minutes`, `45 minutes`, `1 hour`, `2 hours` … `10 hours`, `1 day` (au lieu de « 1 heure », « 2 heures »… « 1 jour »).
- `IaImageInputController` : `Click or drop an image` (et le `placeholder` fourni), `The AI will analyze this image to fill in the form`, `PDF document`.
- `IconInputController` : `Pick an emoji`, `Change emoji`, `Remove emoji`.
- `DurationInputController` : `Hours`, `Minutes`.
- `SelectInputController` : placeholder `Select` (`Select...` passait déjà par `Trans`).
- `Dialog` : `Close` (au lieu de « Fermer »).
- `CommandDialog` : titre et description par défaut `Command palette`, `Search for an action to run…`.
- Éditeur WYSIWYG : `Bold (⌘B)`, `Italic (⌘I)`, `Inline code (⌘E)`, `Paragraph`, `Insert link (⌘K)`, `Add a link`, `Enter the link URL`, `URL`, `Add the link`, `Undo (⌘Z)`, `Redo (⌘⇧Z)`, `Start writing something great…`.

Sans dictionnaire, ces libellés s'affichent désormais en anglais.

Toutes ces nouvelles clés sont ajoutées à `translationKeys` et traduites dans le dictionnaire `fr` de `react-data-form/i18n`.
