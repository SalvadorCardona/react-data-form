---
"react-data-form": patch
---

Les boutons icône ont désormais un nom accessible, traduisible : effacer la date de `DatePickerInputController` (et donc `MomentInputController`) (`Clear the date`), vider `SelectSearchInputController` / `MultiSelectSearchInputController` (`Clear the selection`), retirer un badge de `MultiSelectSearchInputController` (`Remove {{label}}`), retirer l'image d'`IaImageInputController` (`Remove the image`), et les boutons lien, annuler et rétablir de la barre d'outils de `WysiwygInputController` (`Insert link`, `Undo`, `Redo`). Les clés rejoignent `translationKeys` et le dictionnaire `fr`.
