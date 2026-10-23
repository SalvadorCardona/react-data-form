---
"react-data-form": patch
---

Médias : la zone de dépôt vide de `MediaObjectInputController` (et de ses variantes PDF / documents) est un vrai `<button type="button">`, focusable, qui ouvre le sélecteur à Entrée ou Espace ; la tuile « Click to upload » de la galerie aussi. L'input fichier ne porte plus `id="image-upload"` en dur : son id vient de `formInput.id`, sinon de `useId()`, si bien que le libellé du champ lui est relié et que les ids restent uniques sur la page. Sans libellé, l'input est nommé par `dropzoneTitle`, et l'indication des formats lui est reliée par `aria-describedby`. Pendant l'envoi, une zone `role="status"` annonce le nouveau libellé `uploading` (« Uploading... »).
